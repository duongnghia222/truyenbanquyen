import UserModel, { User, UserTransaction, ReadingHistory } from './User';
import NovelModel, { Novel } from './Novel';
import ChapterModel, { Chapter } from './Chapter';
import CommentModel, { 
  NovelComment, 
  ChapterComment, 
  CommentLike,
  NovelCommentModel,
  ChapterCommentModel
} from './Comment';

export {
  // Models
  UserModel,
  NovelModel,
  ChapterModel,
  CommentModel,
  NovelCommentModel,
  ChapterCommentModel,
};

// Use 'export type' for type exports
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

export default {
  UserModel,
  NovelModel,
  ChapterModel,
  CommentModel,
}; 