'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CommentData, PaginationData, ApiErrorResponse } from '@/types/comments';

export function useComments(
  novelId: string | number,
  chapterId: string,
  chapterNumber: number
) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const currentUserId = session?.user?.id?.toString();

  // Helper functions
  const getApiEndpoint = useCallback((action: string, id?: string | number) => {
    const base = '/api/chapter-comments';
    if (action === 'fetch') {
      return `${base}?novel=${novelId}&chapter=${chapterId}&page=${page}&limit=10`;
    }
    if (action === 'create') return base;
    return `${base}/${id}${action === 'like' ? '/like' : ''}`;
  }, [novelId, chapterId, page]);

  const handleApiError = useCallback((err: unknown, defaultMessage: string) => {
    console.error(`Error: ${defaultMessage}`, err);
    setError(err instanceof Error ? err.message : defaultMessage);
    return false;
  }, []);

  const requireAuth = useCallback(() => {
    if (!session?.user) {
      setError('You must be logged in to perform this action');
      return false;
    }
    return true;
  }, [session]);

  const updateCommentInTree = useCallback((
    id: string | number, 
    updater: (comment: CommentData) => CommentData
  ) => {
    const idStr = id.toString();
    
    return (prevComments: CommentData[]) => {
      return prevComments.map(comment => {
        // Update root comment
        if (comment.id.toString() === idStr) {
          return updater(comment);
        }
        
        // Update in replies
        if (comment.replies?.length) {
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply.id.toString() === idStr ? updater(reply) : reply
            )
          };
        }
        
        return comment;
      });
    };
  }, []);

  // Process comments data
  const processComments = useCallback((commentsData: CommentData[]) => {
    const commentMap: Record<string, CommentData> = {};
    const rootComments: CommentData[] = [];
    
    // Index all comments
    commentsData.forEach(comment => {
      const processedComment: CommentData = {
        ...comment,
        id: comment.id.toString(),
        parent: comment.parentId ? comment.parentId.toString() : (comment.parent ? comment.parent.toString() : undefined),
        likes: Array.isArray(comment.likes) ? comment.likes : [],
        isDeleted: !!comment.isDeleted,
        chapterNumber: comment.chapterNumber || chapterNumber,
        _userLiked: currentUserId 
          ? Array.isArray(comment.likes) && comment.likes.some(id => id.toString() === currentUserId)
          : false,
        replies: []
      };
      
      commentMap[processedComment.id] = processedComment;
    });
    
    // Build tree structure
    Object.values(commentMap).forEach(comment => {
      if (comment.parent && commentMap[comment.parent]) {
        if (!commentMap[comment.parent].replies) {
          commentMap[comment.parent].replies = [];
        }
        commentMap[comment.parent].replies!.push(comment);
      } else if (!comment.parent) {
        rootComments.push(comment);
      }
    });
    
    return rootComments;
  }, [chapterNumber, currentUserId]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = getApiEndpoint('fetch');
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(processComments(data.comments));
      setPagination(data.pagination);
    } catch (err) {
      handleApiError(err, 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, [getApiEndpoint, processComments, handleApiError]);

  // Submit a new comment
  const submitComment = useCallback(async (content: string) => {
    if (!requireAuth()) return false;
    
    try {
      const endpoint = getApiEndpoint('create');
      const payload = { content, novelId, chapterId, chapterNumber };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to submit comment');
      }
      
      const newComment = await response.json();
      
      // Update the local state with the new comment
      setComments(prevComments => {
        const commentWithUser = {
          ...newComment,
          user: {
            id: session!.user!.id || '',
            username: session!.user!.name || '',
            avatar: session!.user!.image || ''
          },
          replies: [],
          likes: []
        };
        
        return [commentWithUser, ...prevComments];
      });
      
      // Update pagination if needed
      if (pagination) {
        setPagination(prev => {
          if (!prev) return null;
          return { ...prev, totalItems: prev.totalItems + 1 };
        });
      }
      
      return true;
    } catch (err) {
      return handleApiError(err, 'Failed to submit comment');
    }
  }, [
    requireAuth, getApiEndpoint, novelId, chapterId, chapterNumber, 
    session, pagination, handleApiError
  ]);

  // Submit a reply to a comment
  const submitReply = useCallback(async (content: string, parentId: string | number) => {
    if (!requireAuth()) return false;
    
    try {
      const endpoint = getApiEndpoint('create');
      const payload = { content, novelId, chapterId, parentId, chapterNumber };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to submit reply');
      }
      
      const newReply = await response.json();
      
      // Optimistic update first
      setComments(prevComments => {
        return prevComments.map(comment => {
          if (comment.id.toString() === parentId.toString()) {
            const replyWithUser = {
              ...newReply,
              user: {
                id: session!.user!.id || '',
                username: session!.user!.name || '',
                avatar: session!.user!.image || ''
              },
              parent: parentId.toString(),
              parentId: Number(parentId),
              replies: []
            };
            
            const updatedReplies = comment.replies ? [...comment.replies, replyWithUser] : [replyWithUser];
            
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        });
      });
      
      // Then fetch latest from server to ensure consistency
      await fetchComments();
      
      return true;
    } catch (err) {
      return handleApiError(err, 'Failed to submit reply');
    }
  }, [
    requireAuth, getApiEndpoint, novelId, chapterId, chapterNumber, 
    session, fetchComments, handleApiError
  ]);

  // Edit a comment
  const editComment = useCallback(async (commentId: string | number, content: string) => {
    if (!requireAuth()) return false;
    
    try {
      const endpoint = getApiEndpoint('edit', commentId);
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to edit comment');
      }
      
      const updatedComment = await response.json();
      
      setComments(updateCommentInTree(commentId, comment => ({ 
        ...comment, 
        content, 
        isEdited: true,
        updatedAt: updatedComment.updatedAt || comment.updatedAt
      })));
      
      return true;
    } catch (err) {
      return handleApiError(err, 'Failed to edit comment');
    }
  }, [requireAuth, getApiEndpoint, updateCommentInTree, handleApiError]);

  // Delete a comment
  const deleteComment = useCallback(async (id: string | number) => {
    if (!requireAuth()) return false;
    
    try {
      const endpoint = getApiEndpoint('delete', id);
      const response = await fetch(endpoint, { method: 'DELETE' });
      
      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to delete comment');
      }
      
      setComments(updateCommentInTree(id, comment => ({
        ...comment, 
        isDeleted: true, 
        content: '[Bình luận đã bị xóa]'
      })));

      return true;
    } catch (err) {
      return handleApiError(err, 'Failed to delete comment');
    }
  }, [requireAuth, getApiEndpoint, updateCommentInTree, handleApiError]);

  // Like a comment
  const likeComment = useCallback(async (id: string | number) => {
    if (!requireAuth()) return false;
    
    try {
      const endpoint = getApiEndpoint('like', id);
      const userId = session!.user!.id.toString();
      
      // Optimistic update
      setComments(updateCommentInTree(id, comment => {
        const isCurrentlyLiked = typeof comment._userLiked !== 'undefined'
          ? comment._userLiked
          : comment.likes.some(likeId => likeId.toString() === userId);
        
        const newLikes = isCurrentlyLiked
          ? comment.likes.filter(likeId => likeId.toString() !== userId)
          : [...comment.likes, session!.user!.id];
        
        return {
          ...comment,
          likes: newLikes,
          _userLiked: !isCurrentlyLiked
        };
      }));
      
      // Send request to server
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to like comment');
      }
      
      // Update with server response
      const { userLiked, likes } = await response.json();
      
      setComments(updateCommentInTree(id, comment => ({
        ...comment,
        likes: likes || [],
        _userLiked: userLiked
      })));

      return true;
    } catch (err) {
      // On error, refetch to ensure UI is in sync with server
      fetchComments();
      return handleApiError(err, 'Failed to like comment');
    }
  }, [requireAuth, getApiEndpoint, session, updateCommentInTree, fetchComments, handleApiError]);

  // Fetch comments when component mounts or when dependencies change
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    pagination,
    loading,
    error,
    page,
    setPage,
    submitComment,
    submitReply,
    editComment,
    deleteComment,
    likeComment,
    setError,
    refetch: fetchComments
  };
} 