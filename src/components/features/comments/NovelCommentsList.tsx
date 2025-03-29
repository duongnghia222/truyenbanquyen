'use client';

import { MessageSquare } from 'lucide-react';
import { useNovelComments } from '@/hooks/useNovelComments';
import { CommentItem } from './CommentItem';
import { CommentData } from '@/types/comments';
import { useEffect, useState } from 'react';

interface NovelCommentsListProps {
  novelId: number;
}

export default function NovelCommentsList({ novelId }: NovelCommentsListProps) {
  const [novelSlug, setNovelSlug] = useState<string | null>(null);
  
  // Debug log the props
  useEffect(() => {
    console.log('NovelCommentsList props:', { novelId });
    
    // Fetch the novel slug
    const fetchNovelSlug = async () => {
      try {
        const response = await fetch(`/api/novels/slug-by-id?id=${novelId}`);
        if (response.ok) {
          const data = await response.json();
          setNovelSlug(data.slug);
        }
      } catch (error) {
        console.error('Error fetching novel slug:', error);
      }
    };
    
    fetchNovelSlug();
  }, [novelId]);

  const { 
    comments,
    pagination,
    loading,
    error,
    page,
    setPage,
  } = useNovelComments(novelId);

  // Debugging output
  useEffect(() => {
    if (comments.length > 0) {
      console.log('Novel comment section received comments:', comments);
    }
  }, [comments]);

  return (
    <div>
      {/* Comments list */}
      <div>
        <div className="flex items-center mb-6">
          <MessageSquare className="text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {pagination?.totalItems || 0} Bình luận từ tất cả các chương
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
                onLike={() => Promise.resolve(false)}
                onEdit={() => Promise.resolve(false)}
                onDelete={() => Promise.resolve(false)}
                onReply={() => Promise.resolve(false)}
                showChapter={true}
                novelSlug={novelSlug || ''}
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
            <p>Chưa có bình luận nào cho truyện này</p>
          </div>
        )}
      </div>
    </div>
  );
} 