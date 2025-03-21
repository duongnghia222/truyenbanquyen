import { query } from '../../config/database';

// Chapter Comment type definition
export interface ChapterComment {
  id: number;
  content: string;
  userId: number;
  novelId: number;
  chapterId: number;
  parentId?: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Comment like interface
export interface CommentLike {
  userId: number;
  commentId: number;
  createdAt: Date;
}

class ChapterCommentModel {
  /**
   * Create a chapter comment
   */
  async createChapterComment(commentData: Omit<ChapterComment, 'id' | 'isEdited' | 'isDeleted' | 'createdAt' | 'updatedAt'>): Promise<ChapterComment> {
    const result = await query(
      `INSERT INTO chapter_comments (content, user_id, novel_id, chapter_id, parent_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        commentData.content,
        commentData.userId,
        commentData.novelId,
        commentData.chapterId,
        commentData.parentId || null
      ]
    );
    
    return this.transformChapterCommentData(result.rows[0]);
  }

  /**
   * Get chapter comments
   */
  async getChapterComments(chapterId: number, page: number = 1, limit: number = 20): Promise<{ comments: ChapterComment[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Get total count (only top-level comments)
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM chapter_comments
       WHERE chapter_id = $1 AND parent_id IS NULL`,
      [chapterId]
    );
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get comments
    const commentsResult = await query(
      `SELECT *
       FROM chapter_comments
       WHERE chapter_id = $1 AND parent_id IS NULL
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [chapterId, limit, offset]
    );
    
    const comments = commentsResult.rows.map(row => this.transformChapterCommentData(row));
    
    return { comments, total };
  }

  /**
   * Get chapter comment by ID
   */
  async getChapterCommentById(id: number): Promise<ChapterComment | null> {
    const result = await query(
      'SELECT * FROM chapter_comments WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformChapterCommentData(result.rows[0]);
  }

  /**
   * Get chapter comment replies
   */
  async getChapterCommentReplies(parentId: number): Promise<ChapterComment[]> {
    const result = await query(
      `SELECT *
       FROM chapter_comments
       WHERE parent_id = $1
       ORDER BY created_at ASC`,
      [parentId]
    );
    
    return result.rows.map(row => this.transformChapterCommentData(row));
  }

  /**
   * Update chapter comment
   */
  async updateChapterComment(id: number, content: string): Promise<ChapterComment | null> {
    const result = await query(
      `UPDATE chapter_comments
       SET content = $1, is_edited = true, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [content, id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformChapterCommentData(result.rows[0]);
  }

  /**
   * Delete chapter comment (soft delete)
   */
  async deleteChapterComment(id: number): Promise<boolean> {
    const result = await query(
      `UPDATE chapter_comments
       SET is_deleted = true, updated_at = NOW(), content = '[Bình luận đã bị xóa]'
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    
    return result.rows.length > 0;
  }

  /**
   * Like chapter comment
   */
  async likeChapterComment(userId: number, commentId: number): Promise<boolean> {
    try {
      await query(
        `INSERT INTO chapter_comment_likes (user_id, comment_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, comment_id) DO NOTHING`,
        [userId, commentId]
      );
      return true;
    } catch (error) {
      console.error('Error liking chapter comment:', error);
      return false;
    }
  }

  /**
   * Unlike chapter comment
   */
  async unlikeChapterComment(userId: number, commentId: number): Promise<boolean> {
    const result = await query(
      `DELETE FROM chapter_comment_likes
       WHERE user_id = $1 AND comment_id = $2
       RETURNING user_id`,
      [userId, commentId]
    );
    
    return result.rows.length > 0;
  }

  /**
   * Get chapter comment likes
   */
  async getChapterCommentLikes(commentId: number): Promise<number[]> {
    const result = await query(
      `SELECT user_id
       FROM chapter_comment_likes
       WHERE comment_id = $1`,
      [commentId]
    );
    
    return result.rows.map(row => row.user_id);
  }

  /**
   * Check if user has liked a chapter comment
   */
  async hasUserLikedChapterComment(userId: number, commentId: number): Promise<boolean> {
    const result = await query(
      `SELECT 1
       FROM chapter_comment_likes
       WHERE user_id = $1 AND comment_id = $2
       LIMIT 1`,
      [userId, commentId]
    );
    
    return result.rows.length > 0;
  }

  /**
   * Get user's chapter comments
   */
  async getUserChapterComments(userId: number, page: number = 1, limit: number = 20): Promise<{ comments: ChapterComment[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM chapter_comments
       WHERE user_id = $1 AND is_deleted = false`,
      [userId]
    );
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get comments
    const commentsResult = await query(
      `SELECT *
       FROM chapter_comments
       WHERE user_id = $1 AND is_deleted = false
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    const comments = commentsResult.rows.map(row => this.transformChapterCommentData(row));
    
    return { comments, total };
  }

  /**
   * Transform database row to ChapterComment object
   */
  transformChapterCommentData(row: Record<string, unknown>): ChapterComment {
    return {
      id: Number(row.id),
      content: String(row.content),
      userId: Number(row.user_id),
      novelId: Number(row.novel_id),
      chapterId: Number(row.chapter_id),
      parentId: row.parent_id ? Number(row.parent_id) : undefined,
      isEdited: Boolean(row.is_edited),
      isDeleted: Boolean(row.is_deleted),
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string)
    };
  }
}

// Create a singleton instance
const chapterCommentModel = new ChapterCommentModel(); 

// Export the instance
export default chapterCommentModel; 