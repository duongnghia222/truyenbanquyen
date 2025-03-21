'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<boolean>;
  error: string | null;
  setError: (error: string | null) => void;
}

export function CommentForm({ onSubmit, error, setError }: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setError('Vui lòng đăng nhập để bình luận');
      return;
    }
    
    if (!content.trim()) {
      setError('Bình luận không được để trống');
      return;
    }
    
    setSubmitting(true);
    try {
      const success = await onSubmit(content);
      if (success) {
        setContent('');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!session) {
    return (
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
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="mb-8">
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
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
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
  );
}
