export interface CommentUser {
  id: string | number;
  username: string;
  avatar?: string;
}

export interface CommentData {
  id: string | number;
  content: string;
  user?: CommentUser;
  userId?: number;  // PostgreSQL field
  username?: string;
  userAvatar?: string;
  novel: string;
  chapter?: string;
  parent?: string;
  parentId?: number;  // PostgreSQL parent_id field from the database
  likes: (string | number)[];  // Support both string and number IDs for MongoDB/PostgreSQL
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: CommentData[];
  _userLiked?: boolean; // Additional flag to track user's like status
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
  novelId: string | number;
  chapterId?: string;
  chapterNumber?: number;
}

export interface ApiErrorResponse {
  error: string;
} 