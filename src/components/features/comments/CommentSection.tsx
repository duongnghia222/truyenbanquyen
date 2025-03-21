'use client';

import { MessageSquare } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { CommentSectionProps, CommentData } from './types';
import { useEffect } from 'react';

export default function CommentSection({ novelId, chapterId, chapterNumber }: CommentSectionProps) {
  // Debug log the props
  useEffect(() => {
    console.log('CommentSection props:', { novelId, chapterId, chapterNumber });
  }, [novelId, chapterId, chapterNumber]);

  const { 
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
    refetch
  } = useComments(novelId, chapterId, chapterNumber);

  // Debugging output
  useEffect(() => {
    if (comments.length > 0) {
      console.log('Comment section received comments:', comments);
      // Log the structure of comments with replies
      const commentsWithReplies = comments.filter(c => c.replies && c.replies.length > 0);
      if (commentsWithReplies.length > 0) {
        console.log('Comments with replies:', commentsWithReplies);
      }
    }
  }, [comments]);

  // Wrapper functions to adapt to expected return type
  const handleLike = async (commentId: string) => {
    try {
      const result = await likeComment(commentId);
      if (result) {
        // Optionally refetch to ensure data consistency
        await refetch();
      }
      return result;
    } catch (err) {
      console.error("Error liking comment:", err);
      return false;
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    try {
      await editComment(commentId, content);
      return true;
    } catch (err) {
      console.error("Error editing comment:", err);
      return false;
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      return true;
    } catch (err) {
      console.error("Error deleting comment:", err);
      return false;
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      await submitReply(content, parentId);
      return true;
    } catch (err) {
      console.error("Error replying to comment:", err);
      return false;
    }
  };

  const handleSubmitComment = async (content: string) => {
    try {
      await submitComment(content);
      return true;
    } catch (err) {
      console.error("Error submitting comment:", err);
      return false;
    }
  };

  return (
    <div>
      {/* New comment form */}
      <CommentForm 
        onSubmit={handleSubmitComment}
        error={error}
        setError={setError}
      />

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
            {comments.map((comment: CommentData) => (
              <CommentItem 
                key={comment.id}
                comment={comment}
                onLike={handleLike}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReply={handleReply}
              />
            ))}
            
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