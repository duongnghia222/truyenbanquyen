import UserModel from './User';
import NovelModel from './Novel';
import ChapterModel from './Chapter';
import NovelCommentModel from './NovelComment';
import ChapterCommentModel from './ChapterComment';
import CommentModel from './Comment';

// Import and re-export types
import type { User, UserTransaction, ReadingHistory } from './User';
import type { Novel } from './Novel';
import type { Chapter } from './Chapter';
import type { NovelComment, CommentLike } from './NovelComment';
import type { ChapterComment } from './ChapterComment';

export {
  // Models
  UserModel,
  NovelModel,
  ChapterModel,
  NovelCommentModel,
  ChapterCommentModel,
  CommentModel,
};

// Export types
export type {
  User,
  UserTransaction,
  ReadingHistory,
  Novel,
  Chapter,
  NovelComment,
  ChapterComment,
  CommentLike,
};

const models = {
  UserModel,
  NovelModel,
  ChapterModel,
  CommentModel,
};

export default models; 