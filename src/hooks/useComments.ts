'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CommentData, PaginationData, ApiErrorResponse } from '@/types/comments';

export function useComments(
  novelId: string | number,
  chapterId: string | number,
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
      // Make sure we're using consistent ID handling
      const novelIdParam = typeof novelId === 'number' ? novelId : novelId;
      const chapterIdParam = typeof chapterId === 'number' ? chapterId : chapterId;
      return `${base}?novel=${novelIdParam}&chapter=${chapterIdParam}&page=${page}&limit=10`;
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
    
    console.log('Raw comment data received:', commentsData);
    
    // First pass: Index all comments and initialize basic properties
    commentsData.forEach(comment => {
      // Ensure ID is a string to use as a map key
      const commentId = String(comment.id);
      // Check both parentId and parent fields
      const parentId = comment.parentId ? String(comment.parentId) : comment.parent ? String(comment.parent) : undefined;
      
      // Convert likes to number array
      const likes: number[] = Array.isArray(comment.likes) 
        ? comment.likes.map(id => typeof id === 'string' ? parseInt(id, 10) : Number(id)) 
        : [];
      
      const processedComment: CommentData = {
        ...comment,
        id: commentId,
        parent: parentId,
        parentId: parentId ? Number(parentId) : undefined,
        likes,
        isDeleted: !!comment.isDeleted,
        chapterNumber: comment.chapterNumber || chapterNumber,
        _userLiked: currentUserId 
          ? Array.isArray(comment.likes) && comment.likes.some(id => id.toString() === currentUserId)
          : false,
        replies: []
      };
      
      // Store processed comment in our map
      commentMap[commentId] = processedComment;
      
      // Debug log
      console.log(`Processed comment: ID=${commentId}, parentId=${parentId || 'none'}`);
    });
    
    // Second pass: Build tree structure - attach child comments to their parents
    Object.values(commentMap).forEach(comment => {
      const commentId = String(comment.id);
      // Check both parentId and parent fields consistently
      const parentId = comment.parentId ? String(comment.parentId) : comment.parent;
      
      // If this comment has a parent and we have that parent in our map
      if (parentId && commentMap[parentId]) {
        // Make sure the parent has a replies array
        if (!commentMap[parentId].replies) {
          commentMap[parentId].replies = [];
        }
        
        // Add this comment to its parent's replies
        commentMap[parentId].replies!.push(comment);
        
        // Debug output
        console.log(`Attached comment ${commentId} as reply to ${parentId}`);
      } else if (!parentId) {
        // This is a root comment (no parent)
        rootComments.push(comment);
      } else {
        // This comment has a parent reference but we don't have the parent in our data
        // Add it as a root comment since we can't find its parent
        console.warn(`Comment ${commentId} references parent ${parentId} which was not found in the data`);
        rootComments.push(comment);
      }
    });
    
    console.log('Processed comments:', {
      total: commentsData.length,
      rootCount: rootComments.length,
      withReplies: rootComments.filter(c => c.replies && c.replies.length > 0).length
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
      // Normalize IDs for consistent handling
      const normalizedNovelId = String(novelId);
      const normalizedChapterId = String(chapterId);
      const payload = { 
        content, 
        novelId: normalizedNovelId, 
        chapterId: normalizedChapterId, 
        chapterNumber 
      };
      
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
      // Make sure parentId is consistent with how the API expects it
      const normalizedParentId = String(parentId);
      const payload = { 
        content, 
        novelId, 
        chapterId, 
        parentId: normalizedParentId, 
        chapterNumber 
      };
      
      // Debug
      console.log('Submitting reply with payload:', payload);
      
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
      console.log('Reply submitted successfully:', newReply);
      
      // Optimistic update first
      setComments(prevComments => {
        // Find the parent comment and add the reply to it
        return prevComments.map(comment => {
          if (comment.id.toString() === normalizedParentId) {
            const replyWithUser = {
              ...newReply,
              user: {
                id: session!.user!.id || '',
                username: session!.user!.name || '',
                avatar: session!.user!.image || ''
              },
              parent: normalizedParentId,
              parentId: Number(normalizedParentId),
              likes: [],
              replies: []
            };
            
            // Ensure comment has a replies array
            const existingReplies = Array.isArray(comment.replies) ? comment.replies : [];
            const updatedReplies = [...existingReplies, replyWithUser];
            
            console.log(`Adding reply ${replyWithUser.id} to comment ${comment.id}. Total replies: ${updatedReplies.length}`);
            
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
          : [...comment.likes, Number(session!.user!.id)];
        
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