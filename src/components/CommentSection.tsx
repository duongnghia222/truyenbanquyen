'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, ThumbsUp, Edit, Trash2, Reply, Send } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CommentUser {
  _id: string;
  username: string;
  avatar?: string;
}

interface CommentData {
  _id: string;
  id?: number;  // PostgreSQL ID
  content: string;
  user?: CommentUser;
  userId?: number;  // PostgreSQL field
  username?: string;
  userAvatar?: string;
  novel: string;
  chapter?: string;
  parent?: string;
  likes: (string | number)[];  // Support both string and number IDs for MongoDB/PostgreSQL
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: CommentData[];
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface CommentSectionProps {
  novelId: string | number;
  chapterId?: string;
  chapterNumber?: number;
}

interface ApiErrorResponse {
  error: string;
}

export default function CommentSection({ novelId, chapterId, chapterNumber }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [page, setPage] = useState(1);
  const [chapterIdFromNumber, setChapterIdFromNumber] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Determine if we're dealing with chapter comments
  const isChapterComment = Boolean(chapterId || chapterIdFromNumber || chapterNumber);

  // Fetch chapter ID if we have a chapter number but no chapter ID
  useEffect(() => {
    if (chapterNumber && !chapterId && !chapterIdFromNumber) {
      const fetchChapterId = async () => {
        try {
          const slug = window.location.pathname.split('/')[2];
          const response = await fetch(`/api/novels/${slug}/chapters/${chapterNumber}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch chapter');
          }
          
          const chapter = await response.json();
          setChapterIdFromNumber(chapter._id);
        } catch (error) {
          console.error('Error fetching chapter ID:', error);
        }
      };
      
      fetchChapterId();
    }
  }, [chapterNumber, chapterId, chapterIdFromNumber]);

  // Fetch comments - ensure we're getting likes data for each comment
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        let url;
        const effectiveChapterId = chapterId || chapterIdFromNumber;
        
        // Extract numeric ID if needed
        let effectiveNovelId = novelId;
        
        // Handle the case where the novel object has both id and _id properties
        if (typeof novelId === 'object' && novelId !== null) {
          // @ts-ignore - Handle the case where novelId is an object with id or _id
          effectiveNovelId = novelId.id || novelId._id;
        }
        
        // If it's a string that can be parsed as a number, convert it
        if (typeof effectiveNovelId === 'string' && !isNaN(parseInt(effectiveNovelId))) {
          effectiveNovelId = parseInt(effectiveNovelId);
        }
        
        // If we still don't have a valid ID, try to extract it from the URL
        if (!effectiveNovelId) {
          const slug = window.location.pathname.split('/')[2];
          // Make a request to get the novel ID from the slug
          const response = await fetch(`/api/novels/${slug}`);
          if (response.ok) {
            const novel = await response.json();
            effectiveNovelId = novel.id || novel._id;
          }
        }
        
        if (isChapterComment) {
          // Use chapter comments API
          if (effectiveChapterId) {
            url = `/api/chapter-comments?novel=${effectiveNovelId}&chapter=${effectiveChapterId}&page=${page}&parent=null`;
          } else if (chapterNumber) {
            // If we have a chapter number but no ID yet, use the chapter number route
            const slug = window.location.pathname.split('/')[2];
            url = `/api/novels/${slug}/chapters/${chapterNumber}/comments?page=${page}&parent=null`;
          }
        } else {
          // Use regular comments API for novel comments
          url = `/api/comments?novel=${effectiveNovelId}&page=${page}&parent=null&order=DESC`;
        }
        
        if (!url) {
          throw new Error('Unable to determine API URL');
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        const data = await response.json();
        
        // Ensure each comment has likes data fetched separately if not included
        const commentsWithLikes = await Promise.all(
          data.comments.map(async (comment: CommentData) => {
            // If likes data is missing or undefined, fetch it
            if (!comment.likes) {
              try {
                const commentId = comment.id ? `${comment.id}` : comment._id;
                const likeUrl = isChapterComment 
                  ? `/api/chapter-comments/${commentId}/like` 
                  : `/api/comments/${commentId}/like`;
                
                const likeResponse = await fetch(likeUrl);
                if (likeResponse.ok) {
                  const likeData = await likeResponse.json();
                  // Create a dummy likes array with the appropriate length
                  return {
                    ...comment,
                    likes: Array.from({ length: likeData.likes }, (_, i) => i)
                  };
                }
              } catch (error) {
                console.error(`Error fetching likes for comment ${comment.id || comment._id}:`, error);
              }
            }
            
            // If we don't have likes data (or can't fetch it), ensure it's at least an empty array
            return {
              ...comment,
              likes: comment.likes || []
            };
          })
        );
        
        setComments(commentsWithLikes);
        setPagination(data.pagination);
        
        // Fetch replies for each top-level comment
        const commentsWithReplies = await Promise.all(
          commentsWithLikes.map(async (comment: CommentData) => {
            try {
              const commentId = comment.id ? `${comment.id}` : comment._id;
              
              // Skip fetching replies if already present
              if (comment.replies && comment.replies.length > 0) {
                return comment;
              }
              
              // Determine which API to use for replies
              const repliesUrl = isChapterComment 
                ? `/api/chapter-comments?novel=${effectiveNovelId}&chapter=${effectiveChapterId}&parent=${commentId}` 
                : `/api/comments?novel=${effectiveNovelId}&parent=${commentId}`;
              
              const repliesResponse = await fetch(repliesUrl);
              
              if (!repliesResponse.ok) {
                console.warn(`Failed to fetch replies for comment ${commentId}`);
                return comment;
              }
              
              const repliesData = await repliesResponse.json();
              
              // Ensure replies have likes data
              const repliesWithLikes = await Promise.all(
                repliesData.comments.map(async (reply: CommentData) => {
                  // If likes data is missing or undefined, fetch it
                  if (!reply.likes) {
                    try {
                      const replyId = reply.id ? `${reply.id}` : reply._id;
                      const replyLikeUrl = isChapterComment 
                        ? `/api/chapter-comments/${replyId}/like` 
                        : `/api/comments/${replyId}/like`;
                      
                      const replyLikeResponse = await fetch(replyLikeUrl);
                      if (replyLikeResponse.ok) {
                        const replyLikeData = await replyLikeResponse.json();
                        // Create a dummy likes array with the appropriate length
                        return {
                          ...reply,
                          likes: Array.from({ length: replyLikeData.likes }, (_, i) => i)
                        };
                      }
                    } catch (error) {
                      console.error(`Error fetching likes for reply ${reply.id || reply._id}:`, error);
                    }
                  }
                  
                  // If we don't have likes data (or can't fetch it), ensure it's at least an empty array
                  return {
                    ...reply,
                    likes: reply.likes || []
                  };
                })
              );
              
              // Add replies to the comment
              if (repliesData.comments && repliesData.comments.length > 0) {
                return {
                  ...comment,
                  replies: repliesWithLikes
                };
              }
              
              return comment;
            } catch (error) {
              console.error(`Error fetching replies for comment ${comment.id || comment._id}:`, error);
              return comment;
            }
          })
        );
        
        // Update comments with replies
        setComments(commentsWithReplies);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setError('Không thể tải bình luận. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [novelId, chapterId, chapterNumber, chapterIdFromNumber, page, isChapterComment, refreshTrigger]);

  // Submit a new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setError('Vui lòng đăng nhập để bình luận');
      return;
    }
    
    if (!newComment.trim()) {
      setError('Bình luận không được để trống');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const effectiveChapterId = chapterId || chapterIdFromNumber;
      
      // Determine which API to use
      const apiUrl = isChapterComment ? '/api/chapter-comments' : '/api/comments';
      
      interface CommentRequestBody {
        content: string;
        novelId: string | number;
        parentId: null;
        chapterId?: string;
      }
      
      // Extract numeric ID if needed
      let effectiveNovelId = novelId;
      
      // Handle the case where the novel object has both id and _id properties
      if (typeof novelId === 'object' && novelId !== null) {
        // @ts-ignore - Handle the case where novelId is an object with id or _id
        effectiveNovelId = novelId.id || novelId._id;
      }
      
      // If it's a string that can be parsed as a number, convert it
      if (typeof effectiveNovelId === 'string' && !isNaN(parseInt(effectiveNovelId))) {
        effectiveNovelId = parseInt(effectiveNovelId);
      }
      
      // If we still don't have a valid ID, try to extract it from the URL
      if (!effectiveNovelId) {
        const slug = window.location.pathname.split('/')[2];
        // Make a request to get the novel ID from the slug
        const response = await fetch(`/api/novels/${slug}`);
        if (response.ok) {
          const novel = await response.json();
          effectiveNovelId = novel.id || novel._id;
        }
      }
      
      // If we still don't have a valid ID, throw an error
      if (!effectiveNovelId) {
        throw new Error('Novel ID is required');
      }
      
      const requestBody: CommentRequestBody = {
        content: newComment,
        novelId: effectiveNovelId,
        parentId: null,
      };
      
      // Add chapter ID if this is a chapter comment
      if (isChapterComment && effectiveChapterId) {
        requestBody.chapterId = effectiveChapterId;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to post comment');
      }
      
      const newCommentData = responseData as CommentData;
      
      // Add the new comment to the list
      setComments([newCommentData, ...comments]);
      setNewComment('');
      
      // Update pagination
      if (pagination) {
        setPagination({
          ...pagination,
          totalItems: pagination.totalItems + 1,
          totalPages: Math.ceil((pagination.totalItems + 1) / pagination.limit),
        });
      }
      
      // Trigger a refresh to ensure all data is correctly loaded
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error posting comment:', error);
      setError(error instanceof Error ? error.message : 'Không thể đăng bình luận. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit a reply to a comment
  const handleSubmitReply = async (parentId: string) => {
    if (!session) {
      setError('Vui lòng đăng nhập để bình luận');
      return;
    }
    
    const replyText = replyContent[parentId];
    if (!replyText || !replyText.trim()) {
      setError('Bình luận không được để trống');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const effectiveChapterId = chapterId || chapterIdFromNumber;
      
      // Determine which API to use
      const apiUrl = isChapterComment ? '/api/chapter-comments' : '/api/comments';
      
      // Check if the parentId is numeric
      const effectiveParentId = !isNaN(parseInt(parentId)) ? parseInt(parentId) : parentId;
      
      console.log('Replying to comment with ID:', parentId);
      console.log('Using effective parent ID:', effectiveParentId);
      console.log('ID Type:', typeof effectiveParentId);
      console.log('API URL:', apiUrl);
      console.log('Reply content:', replyText);
      
      interface ReplyRequestBody {
        content: string;
        novelId: string | number;
        parentId: string | number;
        chapterId?: string;
      }
      
      // Extract numeric ID if needed
      let effectiveNovelId = novelId;
      
      // Handle the case where the novel object has both id and _id properties
      if (typeof novelId === 'object' && novelId !== null) {
        // @ts-ignore - Handle the case where novelId is an object with id or _id
        effectiveNovelId = novelId.id || novelId._id;
      }
      
      // If it's a string that can be parsed as a number, convert it
      if (typeof effectiveNovelId === 'string' && !isNaN(parseInt(effectiveNovelId))) {
        effectiveNovelId = parseInt(effectiveNovelId);
      }
      
      // If we still don't have a valid ID, try to extract it from the URL
      if (!effectiveNovelId) {
        const slug = window.location.pathname.split('/')[2];
        // Make a request to get the novel ID from the slug
        const response = await fetch(`/api/novels/${slug}`);
        if (response.ok) {
          const novel = await response.json();
          effectiveNovelId = novel.id || novel._id;
        }
      }
      
      // If we still don't have a valid ID, throw an error
      if (!effectiveNovelId) {
        throw new Error('Novel ID is required');
      }
      
      const requestBody: ReplyRequestBody = {
        content: replyText,
        novelId: effectiveNovelId,
        parentId: effectiveParentId,
      };
      
      // Add chapter ID if this is a chapter comment
      if (isChapterComment && effectiveChapterId) {
        requestBody.chapterId = effectiveChapterId;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to post reply';
        try {
          const responseData = await response.json();
          console.error('Error response:', responseData);
          errorMessage = responseData.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      let newReplyData: CommentData;
      try {
        newReplyData = await response.json() as CommentData;
        console.log('Successfully posted reply:', newReplyData);
        
        // Ensure the reply has the same structure as fetched replies
        // Normalize user data
        if (!newReplyData.user && session.user) {
          newReplyData = {
            ...newReplyData,
            user: {
              _id: session.user.id,
              username: session.user.name || 'User',
              avatar: session.user.image || undefined
            }
          };
        }
        
        // Ensure likes array exists
        if (!newReplyData.likes) {
          newReplyData.likes = [];
        }
      } catch (parseError) {
        console.error('Error parsing successful response:', parseError);
        throw new Error('Failed to parse reply data');
      }
      
      // Find the parent comment and add the reply
      const updatedComments = comments.map(comment => {
        const commentId = comment.id ? `${comment.id}` : comment._id;
        if (commentId === parentId) {
          return {
            ...comment,
            replies: comment.replies ? [...comment.replies, newReplyData] : [newReplyData],
          };
        }
        return comment;
      });
      
      setComments(updatedComments);
      setReplyingTo(null);
      setReplyContent({});
      // Trigger a refresh to fetch all replies from the server
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error posting reply:', error);
      setError(error instanceof Error ? error.message : 'Không thể đăng trả lời. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit a comment
  const handleEditComment = async (commentId: string) => {
    if (!session) {
      setError('Vui lòng đăng nhập để chỉnh sửa bình luận');
      return;
    }
    
    if (!editContent.trim()) {
      setError('Bình luận không được để trống');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Check if the commentId is numeric
      const effectiveCommentId = !isNaN(parseInt(commentId)) ? parseInt(commentId) : commentId;
      
      // Determine which API to use
      const apiUrl = isChapterComment 
        ? `/api/chapter-comments/${effectiveCommentId}` 
        : `/api/comments/${effectiveCommentId}`;
      
      console.log('Editing comment with ID:', commentId);
      console.log('Using effective comment ID:', effectiveCommentId);
      console.log('ID Type:', typeof effectiveCommentId);
      console.log('API URL:', apiUrl);
      console.log('Comment content:', editContent);
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Failed to edit comment';
        try {
          const responseData = await response.json();
          console.error('Error response:', responseData);
          errorMessage = responseData.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      let updatedComment: CommentData;
      try {
        updatedComment = await response.json() as CommentData;
        console.log('Successfully updated comment:', updatedComment);
      } catch (parseError) {
        console.error('Error parsing successful response:', parseError);
        throw new Error('Failed to parse updated comment data');
      }
      
      // Update the comment in the list
      const updatedComments = comments.map(comment => {
        const currentCommentId = comment.id ? `${comment.id}` : comment._id;
        if (currentCommentId === commentId) {
          // Preserve existing replies when updating a comment
          if (comment.replies && !updatedComment.replies) {
            return { ...updatedComment, replies: comment.replies };
          }
          return updatedComment;
        }
        
        // Check if it's a reply
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => {
            const replyId = reply.id ? `${reply.id}` : reply._id;
            return replyId === commentId ? updatedComment : reply;
          });
          return { ...comment, replies: updatedReplies };
        }
        
        return comment;
      });
      
      setComments(updatedComments);
      setEditingId(null);
      setEditContent('');
      
      // Trigger a refresh to ensure all data is correctly loaded
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error editing comment:', error);
      setError(error instanceof Error ? error.message : 'Không thể chỉnh sửa bình luận. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!session) {
      setError('Vui lòng đăng nhập để xóa bình luận');
      return;
    }
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Check if the commentId is numeric
      const effectiveCommentId = !isNaN(parseInt(commentId)) ? parseInt(commentId) : commentId;
      
      console.log('Deleting comment with ID:', commentId);
      console.log('Using effective comment ID:', effectiveCommentId);
      console.log('ID Type:', typeof effectiveCommentId);
      
      // Determine which API to use
      const apiUrl = isChapterComment 
        ? `/api/chapter-comments/${effectiveCommentId}` 
        : `/api/comments/${effectiveCommentId}`;
      
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Failed to delete comment';
        try {
          const responseData = await response.json();
          console.error('Error response:', responseData);
          errorMessage = responseData.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      // Mark comment as deleted in UI
      const updatedComments = comments.map(comment => {
        const currentCommentId = comment.id ? `${comment.id}` : comment._id;
        if (currentCommentId === commentId) {
          return { ...comment, isDeleted: true, content: '[Deleted]' };
        }
        
        // Check if it's a reply
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => {
            const replyId = reply.id ? `${reply.id}` : reply._id;
            return replyId === commentId 
              ? { ...reply, isDeleted: true, content: '[Deleted]' } 
              : reply;
          });
          return { ...comment, replies: updatedReplies };
        }
        
        return comment;
      });
      
      setComments(updatedComments);
      
      // Trigger a refresh to ensure all data is correctly loaded
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError(error instanceof Error ? error.message : 'Không thể xóa bình luận. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // Like a comment
  const handleLikeComment = async (commentId: string) => {
    if (!session) {
      setError('Vui lòng đăng nhập để thích bình luận');
      return;
    }
    
    try {
      // Determine which API to use
      const apiUrl = isChapterComment 
        ? `/api/chapter-comments/${commentId}/like` 
        : `/api/comments/${commentId}/like`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to like comment');
      }
      
      // Get the updated like data from the response
      const { likes: likesCount, userLiked } = responseData;
      
      // Log for debugging
      console.log(`Like response for comment ${commentId}:`, { likesCount, userLiked });
      
      // Update the comment in the list
      const updatedComments = comments.map(comment => {
        const currentCommentId = comment.id ? `${comment.id}` : comment._id;
        if (currentCommentId === commentId) {
          const userId = session.user?.id;
          
          // Instead of trying to modify the likes array, just set the length based on the API response
          // and add or remove the current user's ID as needed
          let updatedLikes: (string | number)[] = [];
          
          if (userLiked) {
            // If user liked the comment, create an array with their ID plus placeholders for other likes
            updatedLikes = Array(likesCount-1).fill(0); // Placeholder likes
            updatedLikes.push(userId); // Add current user's like
          } else {
            // If user unliked, create an array of placeholders without their ID
            updatedLikes = Array(likesCount).fill(0); // Placeholder likes
          }
          
          return { 
            ...comment, 
            likes: updatedLikes,
            _userLiked: userLiked // Add a flag to explicitly track the user's like status
          };
        }
        
        // Check if it's a reply
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => {
            const replyId = reply.id ? `${reply.id}` : reply._id;
            if (replyId === commentId) {
              const userId = session.user?.id;
              
              // Same approach for replies
              let updatedReplyLikes: (string | number)[] = [];
              
              if (userLiked) {
                updatedReplyLikes = Array(likesCount-1).fill(0);
                updatedReplyLikes.push(userId);
              } else {
                updatedReplyLikes = Array(likesCount).fill(0);
              }
              
              return { 
                ...reply, 
                likes: updatedReplyLikes,
                _userLiked: userLiked 
              };
            }
            return reply;
          });
          
          return { ...comment, replies: updatedReplies };
        }
        
        return comment;
      });
      
      setComments(updatedComments);
      
      // Trigger a refresh to ensure all data is correctly loaded
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error liking comment:', error);
      setError(error instanceof Error ? error.message : 'Không thể thích bình luận. Vui lòng thử lại sau.');
    }
  };

  // Start editing a comment
  const startEditing = (comment: CommentData) => {
    // Prioritize PostgreSQL ID format
    const commentId = comment.id ? `${comment.id}` : comment._id;
    console.log('Start editing comment:', comment);
    console.log('Comment ID used for editing:', commentId);
    console.log('Comment ID type:', typeof commentId);
    setEditingId(commentId);
    setEditContent(comment.content);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  // Start replying to a comment
  const startReplying = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent({});
  };

  // Cancel replying
  const cancelReplying = () => {
    setReplyingTo(null);
    setReplyContent({});
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: vi 
      });
    } catch {
      return 'Unknown date';
    }
  };

  // Render a single comment
  const renderComment = (comment: CommentData & { _userLiked?: boolean }, isReply = false) => {
    // Handle both MongoDB and PostgreSQL data structures, prioritizing PostgreSQL
    const commentId = comment.id ? `${comment.id}` : comment._id;
    const userId = comment.userId || comment.user?._id;
    const username = comment.username || comment.user?.username || 'User';
    const avatar = comment.userAvatar || comment.user?.avatar;
    
    // Debug editingId comparison
    if (commentId === editingId) {
      console.log('Rendering edit form for comment:', commentId);
      console.log('editingId:', editingId);
      console.log('Types:', typeof commentId, typeof editingId);
    }
    
    // Ensure user ID comparison works for both string and number types
    const isAuthor = session?.user?.id && (
      session.user.id.toString() === (userId?.toString() || '')
    );
    
    // Check if current user has liked this comment - use the explicit flag if available
    const userLiked = typeof comment._userLiked !== 'undefined' 
      ? comment._userLiked 
      : (Array.isArray(comment.likes) && 
         session?.user?.id && 
         comment.likes.some(id => id.toString() === session.user.id.toString()));
    
    return (
      <div 
        key={commentId} 
        className={`${isReply ? 'ml-12 mt-4' : 'mb-8 border-b border-gray-100 dark:border-gray-700 pb-6'}`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            {avatar ? (
              <Image
                src={avatar}
                alt={username}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-300 font-medium">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <span className="font-medium text-gray-900 dark:text-white">
                {username}
              </span>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
                {comment.isEdited && ' (đã chỉnh sửa)'}
              </span>
            </div>
            
            {editingId === commentId ? (
              <div className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Chỉnh sửa bình luận của bạn..."
                />
                <div className="flex mt-2 space-x-2">
                  <button
                    onClick={() => handleEditComment(commentId)}
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {submitting ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-700 dark:text-gray-300 mt-1">
                {comment.isDeleted ? (
                  <p className="italic text-gray-500 dark:text-gray-400">{comment.content}</p>
                ) : (
                  <p>{comment.content}</p>
                )}
              </div>
            )}
            
            {!comment.isDeleted && (
              <div className="mt-2 flex items-center space-x-4">
                <button
                  onClick={() => handleLikeComment(commentId)}
                  className={`flex items-center text-sm ${
                    userLiked 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <ThumbsUp size={16} className="mr-1" />
                  <span>{Array.isArray(comment.likes) && comment.likes.length > 0 ? comment.likes.length : ''}</span>
                </button>
                
                {!isReply && (
                  <button
                    onClick={() => startReplying(commentId)}
                    className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Reply size={16} className="mr-1" />
                    <span>Trả lời</span>
                  </button>
                )}
                
                {isAuthor && !comment.isDeleted && (
                  <>
                    <button
                      onClick={() => startEditing(comment)}
                      className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Edit size={16} className="mr-1" />
                      <span>Sửa</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteComment(commentId)}
                      className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 size={16} className="mr-1" />
                      <span>Xóa</span>
                    </button>
                  </>
                )}
              </div>
            )}
            
            {/* Reply form */}
            {replyingTo === commentId && (
              <div className="mt-4">
                <textarea
                  value={replyContent[commentId] || ''}
                  onChange={(e) => setReplyContent(prev => ({
                    ...prev,
                    [commentId]: e.target.value
                  }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Viết trả lời của bạn..."
                ></textarea>
                <div className="flex mt-2 space-x-2">
                  <button
                    onClick={() => handleSubmitReply(commentId)}
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi trả lời'}
                  </button>
                  <button
                    onClick={cancelReplying}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
            
            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4">
                {comment.replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* New comment form */}
      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 font-medium">
                    {(session.user?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Viết bình luận của bạn..."
              />
              <div className="mt-2 flex justify-between items-center">
                <div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <Send size={16} className="mr-2" />
                  {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Vui lòng đăng nhập để bình luận
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Đăng nhập
          </Link>
        </div>
      )}

      {/* Comments list */}
      <div>
        <div className="flex items-center mb-6">
          <MessageSquare className="text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {pagination?.totalItems || 0} Bình luận
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : comments.length > 0 ? (
          <div>
            {comments.map(comment => renderComment(comment))}
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  
                  <span className="text-gray-700 dark:text-gray-300">
                    Trang {pagination.currentPage} / {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        )}
      </div>
    </div>
  );
} 