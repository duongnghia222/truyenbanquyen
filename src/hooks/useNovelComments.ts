'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CommentData, PaginationData, ApiErrorResponse } from '@/types/comments';

export function useNovelComments(novelId: string | number) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const currentUserId = session?.user?.id?.toString();

  // Helper functions
  const getApiEndpoint = useCallback((action: string, id?: string | number) => {
    if (action === 'fetch') {
      return `/api/novel-comments?novel=${novelId}&page=${page}&limit=10`;
    }
    return null;
  }, [novelId, page]);

  const handleApiError = useCallback((err: unknown, defaultMessage: string) => {
    console.error(`Error: ${defaultMessage}`, err);
    setError(err instanceof Error ? err.message : defaultMessage);
    return false;
  }, []);

  // Process comments data
  const processComments = useCallback((commentsData: any[]) => {
    return commentsData.map(comment => ({
      ...comment,
      id: Number(comment.id), // Ensure id is a number as per CommentData type
      parentId: comment.parentId ? Number(comment.parentId) : undefined,
      likes: Array.isArray(comment.likes) ? comment.likes : [],
      isDeleted: !!comment.isDeleted,
      _userLiked: currentUserId 
        ? Array.isArray(comment.likes) && comment.likes.some((id: number) => id.toString() === currentUserId)
        : false
    })) as CommentData[];
  }, [currentUserId]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = getApiEndpoint('fetch');
      if (!endpoint) {
        throw new Error('Invalid endpoint');
      }
      
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

  // Initial fetch and refetch on page change
  useEffect(() => {
    fetchComments();
  }, [fetchComments, page]);

  return { 
    comments,
    pagination,
    loading,
    error,
    page,
    setPage,
    setError
  };
} 