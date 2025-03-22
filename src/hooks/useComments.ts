'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CommentData, PaginationData, ApiErrorResponse } from '@/types/comments';

export function useComments(
  novelId: string | number,
  chapterId?: string,
  chapterNumber?: number
) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Determine if we're using chapter comments or novel comments
  const isChapterComment = !!chapterId;

  // Fetch comments
  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Set up the API endpoint based on whether we're fetching chapter or novel comments
      const endpoint = isChapterComment
        ? `/api/chapter-comments?novel=${novelId}&chapter=${chapterId}&page=${page}&limit=10`
        : `/api/novel-comments?novel=${novelId}&page=${page}&limit=10`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to fetch comments');
      }
      
      const data = await response.json();
      console.log('Raw API response:', data.comments);
      
      // Get the current user ID
      const currentUserId = session?.user?.id;
      
      // Build a comment tree structure from flat array
      const commentMap: Record<string, CommentData> = {};
      const rootComments: CommentData[] = [];
      
      // First pass: Index all comments
      data.comments.forEach((comment: CommentData) => {
        // Ensure comment has required properties
        const processedComment = {
          ...comment,
          id: comment.id.toString(),
          // Handle parentId from database correctly
          parent: comment.parentId ? comment.parentId.toString() : (comment.parent ? comment.parent.toString() : undefined),
          likes: Array.isArray(comment.likes) ? comment.likes : [],
          // Make sure isDeleted is correctly set
          isDeleted: !!comment.isDeleted,
          // Check if the current user has liked this comment
          _userLiked: currentUserId 
            ? Array.isArray(comment.likes) && comment.likes.some((id: string | number) => id.toString() === currentUserId.toString())
            : false,
          replies: []
        };
        
        // Add to map for quick lookup
        commentMap[processedComment.id] = processedComment;
      });
      
      // Second pass: Build tree structure
      Object.values(commentMap).forEach(comment => {
        // If the comment has a parent and that parent exists in our map
        if (comment.parent && commentMap[comment.parent]) {
          // Add this comment as a reply to its parent
          if (!commentMap[comment.parent].replies) {
            commentMap[comment.parent].replies = [];
          }
          commentMap[comment.parent].replies!.push(comment);
        } else if (!comment.parent) {
          // This is a root comment with no parent
          rootComments.push(comment);
        }
      });
      
      console.log('Processed comments:', rootComments);
      setComments(rootComments);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, [novelId, chapterId, isChapterComment, page, session]);

  // Submit a new comment
  const submitComment = useCallback(async (content: string) => {
    if (!session?.user) {
      setError('You must be logged in to comment');
      return false;
    }
    
    try {
      // Set up the API endpoint based on whether we're submitting a chapter or novel comment
      const endpoint = isChapterComment
        ? '/api/chapter-comments'
        : '/api/novel-comments';
      
      const payload = isChapterComment
        ? { content, novelId, chapterId, chapterNumber }
        : { content, novelId };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to submit comment');
      }
      
      // Get the new comment from response
      const newComment = await response.json();
      
      // Update the local state with the new comment
      setComments(prevComments => {
        // Add user info from session to the new comment
        const commentWithUser = {
          ...newComment,
          user: {
            id: session.user?.id || '',
            username: session.user?.name || '',
            avatar: session.user?.image || ''
          },
          replies: [],
          likes: []
        };
        
        // Add the new comment to the beginning of the list
        return [commentWithUser, ...prevComments];
      });
      
      // Update pagination if needed
      if (pagination) {
        setPagination(prev => {
          if (!prev) return null;
          return {
            ...prev,
            totalItems: prev.totalItems + 1
          };
        });
      }
      
      return true;
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit comment');
      return false;
    }
  }, [session, novelId, chapterId, chapterNumber, isChapterComment, pagination]);

  // Submit a reply to a comment
  const submitReply = useCallback(async (content: string, parentId: string | number) => {
    if (!session?.user) {
      setError('You must be logged in to reply');
      return false;
    }
    
    try {
      // Set up the API endpoint based on whether we're submitting a chapter or novel comment reply
      const endpoint = isChapterComment
        ? '/api/chapter-comments'
        : '/api/novel-comments';
      
      const payload = isChapterComment
        ? { content, novelId, chapterId, parentId, chapterNumber }
        : { content, novelId, parentId };
      
      console.log('Submitting reply with payload:', payload);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to submit reply');
      }
      
      // Get the new reply from response
      const newReply = await response.json();
      console.log('Reply API response:', newReply);
      
      // Update the local state to add the reply without a full refresh
      setComments(prevComments => {
        console.log('Current comments before adding reply:', prevComments);
        
        const updatedComments = prevComments.map(comment => {
          // If this is the parent comment, add the new reply
          if (comment.id.toString() === parentId.toString()) {
            console.log('Found parent comment:', comment);
            
            // Add user info from session to the new reply
            const replyWithUser = {
              ...newReply,
              user: {
                id: session.user?.id || '',
                username: session.user?.name || '',
                avatar: session.user?.image || ''
              },
              // Ensure the reply has correct parent reference
              parent: parentId.toString(),
              // In case the API returns parentId instead of parent
              parentId: Number(parentId),
              replies: []
            };
            
            // Create a new array of replies with the new reply added
            const updatedReplies = comment.replies ? [...comment.replies, replyWithUser] : [replyWithUser];
            
            const updatedComment = {
              ...comment,
              replies: updatedReplies
            };
            
            console.log('Updated parent comment with reply:', updatedComment);
            return updatedComment;
          }
          
          return comment;
        });
        
        console.log('Updated comments after adding reply:', updatedComments);
        return updatedComments;
      });
      
      // Refetch comments after adding a reply to ensure correct server-side data structure
      await fetchComments();
      
      return true;
    } catch (err) {
      console.error('Error submitting reply:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit reply');
      return false;
    }
  }, [session, novelId, chapterId, chapterNumber, isChapterComment, fetchComments]);

  // Edit a comment
  const editComment = useCallback(async (id: string | number, content: string) => {
    if (!session?.user) {
      setError('You must be logged in to edit a comment');
      return false;
    }
    
    try {
      // Set up the API endpoint based on whether we're editing a chapter or novel comment
      const endpoint = isChapterComment
        ? `/api/chapter-comments/${id}`
        : `/api/novel-comments/${id}`;
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to edit comment');
      }
      
      // Get the updated comment from the response
      const updatedComment = await response.json();
      
      // Update the comment in the local state with better nested reply handling
      setComments(prevComments => {
        // Create a deep copy to avoid mutation issues
        return prevComments.map(comment => {
          // If this is the comment we're editing
          if (comment.id.toString() === id.toString()) {
            return { 
              ...comment, 
              content, 
              isEdited: true,
              updatedAt: updatedComment.updatedAt || comment.updatedAt
            };
          }
          
          // Check for the comment in replies
          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = comment.replies.map(reply => 
              reply.id.toString() === id.toString() 
                ? { 
                    ...reply, 
                    content, 
                    isEdited: true,
                    updatedAt: updatedComment.updatedAt || reply.updatedAt
                  } 
                : reply
            );
            
            return {
              ...comment,
              replies: updatedReplies
            };
          }
          
          return comment;
        });
      });
      
      return true;
    } catch (err) {
      console.error('Error editing comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to edit comment');
      return false;
    }
  }, [session, isChapterComment]);

  // Delete a comment
  const deleteComment = useCallback(async (id: string | number) => {
    if (!session?.user) {
      setError('You must be logged in to delete a comment');
      return false;
    }
    
    try {
      // Set up the API endpoint based on whether we're deleting a chapter or novel comment
      const endpoint = isChapterComment
        ? `/api/chapter-comments/${id}`
        : `/api/novel-comments/${id}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to delete comment');
      }
      
      // Update the comment in the local state to show as deleted
      setComments(prevComments => {
        // Check if this is a top-level comment
        const updatedComments = prevComments.map(comment => {
          if (comment.id.toString() === id.toString()) {
            return { ...comment, isDeleted: true, content: '[Bình luận đã bị xóa]' };
          }
          
          // Check if this is a reply
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id.toString() === id.toString() 
                  ? { ...reply, isDeleted: true, content: '[Bình luận đã bị xóa]' } 
                  : reply
              )
            };
          }
          
          return comment;
        });
        
        return updatedComments;
      });

      return true;
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      return false;
    }
  }, [session, isChapterComment]);

  // Like a comment
  const likeComment = useCallback(async (id: string | number) => {
    if (!session?.user) {
      setError('You must be logged in to like a comment');
      return false;
    }
    
    try {
      // Set up the API endpoint based on whether we're liking a chapter or novel comment
      const endpoint = isChapterComment
        ? `/api/chapter-comments/${id}/like`
        : `/api/novel-comments/${id}/like`;
      
      console.log('Liking comment with endpoint:', endpoint);
      
      // First update the UI optimistically
      const commentId = id.toString();
      const userId = session.user.id.toString();
      
      setComments(prevComments => {
        return prevComments.map(comment => {
          // If this is the comment we're liking
          if (comment.id.toString() === commentId) {
            // Determine if this would be a like or unlike action
            const isCurrentlyLiked = typeof comment._userLiked !== 'undefined'
              ? comment._userLiked
              : comment.likes.some(likeId => likeId.toString() === userId);
            
            // Update likes array for optimistic UI
            const newLikes = isCurrentlyLiked
              ? comment.likes.filter(likeId => likeId.toString() !== userId)
              : [...comment.likes, session.user.id];
            
            return {
              ...comment,
              likes: newLikes,
              _userLiked: !isCurrentlyLiked
            };
          }
          
          // Check replies
          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = comment.replies.map(reply => {
              if (reply.id.toString() === commentId) {
                // Determine if this would be a like or unlike action
                const isCurrentlyLiked = typeof reply._userLiked !== 'undefined'
                  ? reply._userLiked
                  : reply.likes.some(likeId => likeId.toString() === userId);
                
                // Update likes array for optimistic UI
                const newLikes = isCurrentlyLiked
                  ? reply.likes.filter(likeId => likeId.toString() !== userId)
                  : [...reply.likes, session.user.id];
                
                return {
                  ...reply,
                  likes: newLikes,
                  _userLiked: !isCurrentlyLiked
                };
              }
              return reply;
            });
            
            return {
              ...comment,
              replies: updatedReplies
            };
          }
          
          return comment;
        });
      });
      
      // Send request to server
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Failed to like comment');
      }
      
      // Get the actual response from server
      const data = await response.json();
      const { userLiked, likes } = data;
      
      console.log('Like response:', data);
      
      // Update state with the actual server response (to correct any discrepancies)
      setComments(prevComments => {
        return prevComments.map(comment => {
          // If this is the comment we're liking
          if (comment.id.toString() === commentId) {
            return { 
              ...comment, 
              likes: likes || [], // Use the likes array directly from the API
              _userLiked: userLiked
            };
          }
          
          // Check if this is a reply
          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = comment.replies.map(reply => {
              if (reply.id.toString() === commentId) {
                return { 
                  ...reply, 
                  likes: likes || [], // Use the likes array directly from the API
                  _userLiked: userLiked
                };
              }
              return reply;
            });
            
            return {
              ...comment,
              replies: updatedReplies
            };
          }
          
          return comment;
        });
      });

      return true;
    } catch (err) {
      console.error('Error liking comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to like comment');
      // Refetch to ensure UI is in sync with server on error
      fetchComments();
      return false;
    }
  }, [session, isChapterComment, fetchComments]);

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