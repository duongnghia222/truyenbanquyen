'use client';

import { useState } from 'react';
import { ThumbsUp, Edit, Trash2, Reply } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useSession } from 'next-auth/react';
import { CommentData } from '@/types/comments';
import { EditForm } from './EditForm';
import { ReplyForm } from './ReplyForm';

interface CommentItemProps {
  comment: CommentData & { _userLiked?: boolean };
  isReply?: boolean;
  onLike: (commentId: string) => Promise<boolean>;
  onEdit: (commentId: string, content: string) => Promise<boolean>;
  onDelete: (commentId: string) => Promise<boolean>;
  onReply: (parentId: string, content: string) => Promise<boolean>;
}

export function CommentItem({
  comment,
  isReply = false,
  onLike,
  onEdit,
  onDelete,
  onReply
}: CommentItemProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  
  // Handle PostgreSQL data structure
  const commentId = comment.id ? `${comment.id}` : '';
  const userId = comment.userId || comment.user?.id;
  const username = comment.username || comment.user?.username || 'User';
  const avatar = comment.userAvatar || comment.user?.avatar;
  
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
  
  // Handle edit
  const handleEdit = async (content: string) => {
    const success = await onEdit(commentId, content);
    if (success) {
      setIsEditing(false);
    }
    return success;
  };
  
  // Handle reply
  const handleReply = async (content: string) => {
    const success = await onReply(commentId, content);
    if (success) {
      setIsReplying(false);
    }
    return success;
  };
  
  // Recursively render replies
  const renderReplies = (replyList: CommentData[]) => {
    if (!replyList || replyList.length === 0) return null;
    
    console.log('Rendering replies:', replyList);
    
    return (
      <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
        {replyList.map(reply => (
          <CommentItem
            key={reply.id}
            comment={reply}
            isReply={true}
            onLike={onLike}
            onEdit={onEdit}
            onDelete={onDelete}
            onReply={onReply}
          />
        ))}
      </div>
    );
  };
  
  // Debugging comment data
  console.log(`Rendering comment ${commentId}:`, { 
    id: comment.id,
    parent: comment.parent,
    parentId: comment.parentId,
    replies: comment.replies?.length || 0
  });
  
  return (
    <div className={`${isReply ? 'mt-4 mb-4' : 'mb-8 border-b border-gray-100 dark:border-gray-700 pb-6'}`}>
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
              {comment.isEdited && !comment.isDeleted && ' (đã chỉnh sửa)'}
              {comment.isDeleted && ' (đã xóa)'}
            </span>
          </div>
          
          {isEditing ? (
            <EditForm 
              initialContent={comment.content} 
              onSave={handleEdit} 
              onCancel={() => setIsEditing(false)} 
            />
          ) : (
            <div className="text-gray-700 dark:text-gray-300 mt-1">
              {comment.isDeleted ? (
                <p className="italic text-gray-500 dark:text-gray-400">[Bình luận đã bị xóa]</p>
              ) : (
                <p>{comment.content}</p>
              )}
            </div>
          )}
          
          {!comment.isDeleted && (
            <div className="mt-2 flex items-center space-x-4">
              <button
                onClick={() => onLike(commentId)}
                className={`flex items-center text-sm ${
                  userLiked 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                aria-label={userLiked ? "Unlike this comment" : "Like this comment"}
              >
                <ThumbsUp 
                  size={16} 
                  className="mr-1" 
                  fill={userLiked ? "currentColor" : "none"}
                />
                <span>{comment.likes && comment.likes.length > 0 ? comment.likes.length : ''}</span>
              </button>
              
              {!isReply && (
                <button
                  onClick={() => setIsReplying(true)}
                  className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Reply size={16} className="mr-1" />
                  <span>Trả lời</span>
                </button>
              )}
              
              {isAuthor && !comment.isDeleted && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Edit size={16} className="mr-1" />
                    <span>Sửa</span>
                  </button>
                  
                  <button
                    onClick={() => onDelete(commentId)}
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
          {isReplying && (
            <ReplyForm
              onSubmit={handleReply}
              onCancel={() => setIsReplying(false)}
            />
          )}
          
          {/* Render replies using the recursive function */}
          {renderReplies(comment.replies || [])}
        </div>
      </div>
    </div>
  );
}
