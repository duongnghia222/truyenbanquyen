import UserModel from './User';
import NovelModel from './Novel';
import ChapterModel from './Chapter';
import ChapterCommentModel from './ChapterComment';

// Import and re-export types
import type { User, UserTransaction, ReadingHistory } from './User';
import type { Novel } from './Novel';
import type { Chapter } from './Chapter';
import type { ChapterComment, CommentLike } from './ChapterComment';

export {
  // Models
  UserModel,
  NovelModel,
  ChapterModel,
  ChapterCommentModel,
};

// Export types
export type {
  User,
  UserTransaction,
  ReadingHistory,
  Novel,
  Chapter,
  ChapterComment,
  CommentLike,
};

const models = {
  UserModel,
  NovelModel,
  ChapterModel,
  ChapterCommentModel,
};

export default models; 