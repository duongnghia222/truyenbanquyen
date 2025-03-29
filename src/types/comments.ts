export interface CommentUser {
  id: number;
  username: string;
  avatar?: string;
}

export interface CommentData {
  id: number;
  content: string;
  user?: CommentUser;
  userId: number;
  novelId: number;
  chapterId: number;
  chapterNumber: number;
  parentId?: number;
  likes: number[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: CommentData[];
  _userLiked?: boolean;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface CommentSectionProps {
  novelId: number;
  chapterId?: number;
  chapterNumber?: number;
}

export interface ApiErrorResponse {
  error: string;
} 