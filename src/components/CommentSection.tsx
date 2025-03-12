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
  content: string;
  user: CommentUser;
  username?: string;
  userAvatar?: string;
  novel: string;
  chapter?: string;
  parent?: string;
  likes: string[];
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
  novelId: string;
  chapterId?: string;
  chapterNumber?: number;
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
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [page, setPage] = useState(1);
  const [chapterIdFromNumber, setChapterIdFromNumber] = useState<string | null>(null);
  
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
        } catch (err) {
          console.error('Error fetching chapter ID:', err);
        }
      };
      
      fetchChapterId();
    }
  }, [chapterNumber, chapterId, chapterIdFromNumber]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        let url;
        const effectiveChapterId = chapterId || chapterIdFromNumber;
        
        if (isChapterComment) {
          // Use chapter comments API
          if (effectiveChapterId) {
            url = `/api/chapter-comments?novel=${novelId}&chapter=${effectiveChapterId}&page=${page}&parent=null`;
          } else if (chapterNumber) {
            // If we have a chapter number but no ID yet, use the chapter number route
            const slug = window.location.pathname.split('/')[2];
            url = `/api/novels/${slug}/chapters/${chapterNumber}/comments?page=${page}&parent=null`;
          }
        } else {
          // Use regular comments API for novel comments
          url = `/api/comments?novel=${novelId}&page=${page}&parent=null`;
        }
        
        if (!url) {
          throw new Error('Unable to determine API URL');
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        const data = await response.json();
        setComments(data.comments);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Không thể tải bình luận. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [novelId, chapterId, chapterNumber, chapterIdFromNumber, page, isChapterComment]);

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
      
      const requestBody: any = {
        content: newComment,
        novelId,
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post comment');
      }
      
      const newCommentData = await response.json();
      
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
    } catch (err: any) {
      console.error('Error posting comment:', err);
      setError(err.message || 'Không thể đăng bình luận. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit a reply to a comment
  const handleSubmitReply = async (parentId: string) => {
    if (!session) {
      setError('Vui lòng đăng nhập để trả lời bình luận');
      return;
    }
    
    if (!replyContent.trim()) {
      setError('Trả lời không được để trống');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const effectiveChapterId = chapterId || chapterIdFromNumber;
      
      // Determine which API to use
      const apiUrl = isChapterComment ? '/api/chapter-comments' : '/api/comments';
      
      const requestBody: any = {
        content: replyContent,
        novelId,
        parentId,
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post reply');
      }
      
      const newReplyData = await response.json();
      
      // Find the parent comment and add the reply
      const updatedComments = comments.map(comment => {
        if (comment._id === parentId) {
          return {
            ...comment,
            replies: comment.replies ? [...comment.replies, newReplyData] : [newReplyData],
          };
        }
        return comment;
      });
      
      setComments(updatedComments);
      setReplyingTo(null);
      setReplyContent('');
    } catch (err: any) {
      console.error('Error posting reply:', err);
      setError(err.message || 'Không thể đăng trả lời. Vui lòng thử lại sau.');
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
      // Determine which API to use
      const apiUrl = isChapterComment 
        ? `/api/chapter-comments/${commentId}` 
        : `/api/comments/${commentId}`;
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit comment');
      }
      
      const updatedComment = await response.json();
      
      // Update the comment in the list
      const updatedComments = comments.map(comment => {
        if (comment._id === commentId) {
          return updatedComment;
        }
        
        // Check if it's a reply
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => 
            reply._id === commentId ? updatedComment : reply
          );
          return { ...comment, replies: updatedReplies };
        }
        
        return comment;
      });
      
      setComments(updatedComments);
      setEditingId(null);
      setEditContent('');
    } catch (err: any) {
      console.error('Error editing comment:', err);
      setError(err.message || 'Không thể chỉnh sửa bình luận. Vui lòng thử lại sau.');
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
      // Determine which API to use
      const apiUrl = isChapterComment 
        ? `/api/chapter-comments/${commentId}` 
        : `/api/comments/${commentId}`;
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }
      
      // Update the comment list
      const updatedComments = comments.map(comment => {
        if (comment._id === commentId) {
          return { ...comment, isDeleted: true, content: 'This comment was deleted by the user.' };
        }
        
        // Check if it's a reply
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => 
            reply._id === commentId 
              ? { ...reply, isDeleted: true, content: 'This comment was deleted by the user.' } 
              : reply
          );
          return { ...comment, replies: updatedReplies };
        }
        
        return comment;
      });
      
      setComments(updatedComments);
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(err.message || 'Không thể xóa bình luận. Vui lòng thử lại sau.');
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to like comment');
      }
      
      const likeData = await response.json();
      
      // Update the comment in the list
      const updatedComments = comments.map(comment => {
        if (comment._id === commentId) {
          // Toggle like status
          const userId = session.user?.id;
          const userLiked = likeData.userLiked;
          
          let updatedLikes = [...comment.likes];
          if (userLiked) {
            // Add user to likes
            updatedLikes.push(userId as string);
          } else {
            // Remove user from likes
            updatedLikes = updatedLikes.filter(id => id !== userId);
          }
          
          return { ...comment, likes: updatedLikes };
        }
        
        // Check if it's a reply
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => {
            if (reply._id === commentId) {
              const userId = session.user?.id;
              const userLiked = likeData.userLiked;
              
              let updatedLikes = [...reply.likes];
              if (userLiked) {
                updatedLikes.push(userId as string);
              } else {
                updatedLikes = updatedLikes.filter(id => id !== userId);
              }
              
              return { ...reply, likes: updatedLikes };
            }
            return reply;
          });
          
          return { ...comment, replies: updatedReplies };
        }
        
        return comment;
      });
      
      setComments(updatedComments);
    } catch (err: any) {
      console.error('Error liking comment:', err);
      setError(err.message || 'Không thể thích bình luận. Vui lòng thử lại sau.');
    }
  };

  // Start editing a comment
  const startEditing = (comment: CommentData) => {
    setEditingId(comment._id);
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
    setReplyContent('');
  };

  // Cancel replying
  const cancelReplying = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: vi 
      });
    } catch (err) {
      return 'Unknown date';
    }
  };

  // Render a single comment
  const renderComment = (comment: CommentData, isReply = false) => {
    const isAuthor = session?.user?.id === comment.user._id;
    const userLiked = session?.user?.id && comment.likes.includes(session.user.id);
    
    return (
      <div 
        key={comment._id} 
        className={`${isReply ? 'ml-12 mt-4' : 'mb-8 border-b border-gray-100 dark:border-gray-700 pb-6'}`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            {comment.userAvatar || comment.user.avatar ? (
              <Image
                src={comment.userAvatar || comment.user.avatar || '/images/default-avatar.png'}
                alt={comment.username || comment.user.username}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-300 font-medium">
                  {(comment.username || comment.user.username || 'User').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <span className="font-medium text-gray-900 dark:text-white">
                {comment.username || comment.user.username}
              </span>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
                {comment.isEdited && ' (đã chỉnh sửa)'}
              </span>
            </div>
            
            {editingId === comment._id ? (
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
                    onClick={() => handleEditComment(comment._id)}
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
                  onClick={() => handleLikeComment(comment._id)}
                  className={`flex items-center text-sm ${
                    userLiked 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <ThumbsUp size={16} className="mr-1" />
                  <span>{comment.likes.length > 0 ? comment.likes.length : ''}</span>
                </button>
                
                {!isReply && (
                  <button
                    onClick={() => startReplying(comment._id)}
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
                      onClick={() => handleDeleteComment(comment._id)}
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
            {replyingTo === comment._id && (
              <div className="mt-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Viết trả lời của bạn..."
                />
                <div className="flex mt-2 space-x-2">
                  <button
                    onClick={() => handleSubmitReply(comment._id)}
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