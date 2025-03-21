// Re-export types from NovelComment and ChapterComment models
import type { NovelComment, CommentLike } from './NovelComment';
import type { ChapterComment } from './ChapterComment';

// Re-export these types
export type { NovelComment, CommentLike, ChapterComment };

// Import the actual model implementations
import NovelCommentModel from './NovelComment';
import ChapterCommentModel from './ChapterComment';

// Re-export the model implementations
export { NovelCommentModel, ChapterCommentModel };

/**
 * CommentModel - Backward compatibility layer
 * This model delegates to NovelCommentModel and ChapterCommentModel
 */
class CommentModel {
  // Novel Comment methods
  async createNovelComment(...args: Parameters<typeof NovelCommentModel.createNovelComment>) {
    return NovelCommentModel.createNovelComment(...args);
  }

  async getNovelComments(...args: Parameters<typeof NovelCommentModel.getNovelComments>) {
    return NovelCommentModel.getNovelComments(...args);
  }

  async getNovelCommentById(...args: Parameters<typeof NovelCommentModel.getNovelCommentById>) {
    return NovelCommentModel.getNovelCommentById(...args);
  }

  async getNovelCommentReplies(...args: Parameters<typeof NovelCommentModel.getNovelCommentReplies>) {
    return NovelCommentModel.getNovelCommentReplies(...args);
  }

  async updateNovelComment(...args: Parameters<typeof NovelCommentModel.updateNovelComment>) {
    return NovelCommentModel.updateNovelComment(...args);
  }

  async deleteNovelComment(...args: Parameters<typeof NovelCommentModel.deleteNovelComment>) {
    return NovelCommentModel.deleteNovelComment(...args);
  }

  async likeNovelComment(...args: Parameters<typeof NovelCommentModel.likeNovelComment>) {
    return NovelCommentModel.likeNovelComment(...args);
  }

  async unlikeNovelComment(...args: Parameters<typeof NovelCommentModel.unlikeNovelComment>) {
    return NovelCommentModel.unlikeNovelComment(...args);
  }

  async getNovelCommentLikes(...args: Parameters<typeof NovelCommentModel.getNovelCommentLikes>) {
    return NovelCommentModel.getNovelCommentLikes(...args);
  }

  async hasUserLikedNovelComment(...args: Parameters<typeof NovelCommentModel.hasUserLikedNovelComment>) {
    return NovelCommentModel.hasUserLikedNovelComment(...args);
  }

  async getUserNovelComments(...args: Parameters<typeof NovelCommentModel.getUserNovelComments>) {
    return NovelCommentModel.getUserNovelComments(...args);
  }

  // Chapter Comment methods
  async createChapterComment(...args: Parameters<typeof ChapterCommentModel.createChapterComment>) {
    return ChapterCommentModel.createChapterComment(...args);
  }

  async getChapterComments(...args: Parameters<typeof ChapterCommentModel.getChapterComments>) {
    return ChapterCommentModel.getChapterComments(...args);
  }

  async getChapterCommentById(...args: Parameters<typeof ChapterCommentModel.getChapterCommentById>) {
    return ChapterCommentModel.getChapterCommentById(...args);
  }

  async getChapterCommentReplies(...args: Parameters<typeof ChapterCommentModel.getChapterCommentReplies>) {
    return ChapterCommentModel.getChapterCommentReplies(...args);
  }

  async updateChapterComment(...args: Parameters<typeof ChapterCommentModel.updateChapterComment>) {
    return ChapterCommentModel.updateChapterComment(...args);
  }

  async deleteChapterComment(...args: Parameters<typeof ChapterCommentModel.deleteChapterComment>) {
    return ChapterCommentModel.deleteChapterComment(...args);
  }

  async likeChapterComment(...args: Parameters<typeof ChapterCommentModel.likeChapterComment>) {
    return ChapterCommentModel.likeChapterComment(...args);
  }

  async unlikeChapterComment(...args: Parameters<typeof ChapterCommentModel.unlikeChapterComment>) {
    return ChapterCommentModel.unlikeChapterComment(...args);
  }

  async getChapterCommentLikes(...args: Parameters<typeof ChapterCommentModel.getChapterCommentLikes>) {
    return ChapterCommentModel.getChapterCommentLikes(...args);
  }

  async hasUserLikedChapterComment(...args: Parameters<typeof ChapterCommentModel.hasUserLikedChapterComment>) {
    return ChapterCommentModel.hasUserLikedChapterComment(...args);
  }

  async getUserChapterComments(...args: Parameters<typeof ChapterCommentModel.getUserChapterComments>) {
    return ChapterCommentModel.getUserChapterComments(...args);
  }

  // Generic helper methods
  transformNovelCommentData(...args: Parameters<typeof NovelCommentModel.transformNovelCommentData>) {
    return NovelCommentModel.transformNovelCommentData(...args);
  }
}

// Create a singleton instance
const commentModel = new CommentModel();

// Export the instance
export default commentModel; 