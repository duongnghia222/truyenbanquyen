import { query } from '../../config/database';

// Novel Comment type definition
export interface NovelComment {
  id: number;
  content: string;
  userId: number;
  novelId: number;
  parentId?: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

class CommentModel {
  /**
   * Create a novel comment
   */
  async createNovelComment(commentData: Omit<NovelComment, 'id' | 'isEdited' | 'isDeleted' | 'createdAt' | 'updatedAt'>): Promise<NovelComment> {
    const result = await query(
      `INSERT INTO novel_comments (content, user_id, novel_id, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        commentData.content,
        commentData.userId,
        commentData.novelId,
        commentData.parentId || null
      ]
    );
    
    return this.transformNovelCommentData(result.rows[0]);
  }

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
   * Get novel comments
   */
  async getNovelComments(novelId: number, page: number = 1, limit: number = 20): Promise<{ comments: NovelComment[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Get total count (only top-level comments)
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM novel_comments
       WHERE novel_id = $1 AND parent_id IS NULL AND is_deleted = false`,
      [novelId]
    );
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get comments
    const commentsResult = await query(
      `SELECT *
       FROM novel_comments
       WHERE novel_id = $1 AND parent_id IS NULL AND is_deleted = false
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [novelId, limit, offset]
    );
    
    const comments = commentsResult.rows.map(row => this.transformNovelCommentData(row));
    
    return { comments, total };
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
       WHERE chapter_id = $1 AND parent_id IS NULL AND is_deleted = false`,
      [chapterId]
    );
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get comments
    const commentsResult = await query(
      `SELECT *
       FROM chapter_comments
       WHERE chapter_id = $1 AND parent_id IS NULL AND is_deleted = false
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [chapterId, limit, offset]
    );
    
    const comments = commentsResult.rows.map(row => this.transformChapterCommentData(row));
    
    return { comments, total };
  }

  /**
   * Get novel comment by ID
   */
  async getNovelCommentById(id: number): Promise<NovelComment | null> {
    const result = await query(
      'SELECT * FROM novel_comments WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformNovelCommentData(result.rows[0]);
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
   * Get novel comment replies
   */
  async getNovelCommentReplies(parentId: number): Promise<NovelComment[]> {
    const result = await query(
      `SELECT *
       FROM novel_comments
       WHERE parent_id = $1 AND is_deleted = false
       ORDER BY created_at ASC`,
      [parentId]
    );
    
    return result.rows.map(row => this.transformNovelCommentData(row));
  }

  /**
   * Get chapter comment replies
   */
  async getChapterCommentReplies(parentId: number): Promise<ChapterComment[]> {
    const result = await query(
      `SELECT *
       FROM chapter_comments
       WHERE parent_id = $1 AND is_deleted = false
       ORDER BY created_at ASC`,
      [parentId]
    );
    
    return result.rows.map(row => this.transformChapterCommentData(row));
  }

  /**
   * Update novel comment
   */
  async updateNovelComment(id: number, content: string): Promise<NovelComment | null> {
    const result = await query(
      `UPDATE novel_comments
       SET content = $1, is_edited = true, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [content, id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformNovelCommentData(result.rows[0]);
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
   * Delete novel comment (soft delete)
   */
  async deleteNovelComment(id: number): Promise<boolean> {
    const result = await query(
      `UPDATE novel_comments
       SET is_deleted = true, updated_at = NOW(), content = '[Deleted]'
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    
    return result.rows.length > 0;
  }

  /**
   * Delete chapter comment (soft delete)
   */
  async deleteChapterComment(id: number): Promise<boolean> {
    const result = await query(
      `UPDATE chapter_comments
       SET is_deleted = true, updated_at = NOW(), content = '[Deleted]'
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    
    return result.rows.length > 0;
  }

  /**
   * Like novel comment
   */
  async likeNovelComment(userId: number, commentId: number): Promise<boolean> {
    try {
      await query(
        `INSERT INTO novel_comment_likes (user_id, comment_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, comment_id) DO NOTHING`,
        [userId, commentId]
      );
      return true;
    } catch (error) {
      console.error('Error liking novel comment:', error);
      return false;
    }
  }

  /**
   * Unlike novel comment
   */
  async unlikeNovelComment(userId: number, commentId: number): Promise<boolean> {
    const result = await query(
      `DELETE FROM novel_comment_likes
       WHERE user_id = $1 AND comment_id = $2
       RETURNING user_id`,
      [userId, commentId]
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
   * Get novel comment likes
   */
  async getNovelCommentLikes(commentId: number): Promise<number[]> {
    const result = await query(
      `SELECT user_id
       FROM novel_comment_likes
       WHERE comment_id = $1`,
      [commentId]
    );
    
    return result.rows.map(row => row.user_id);
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
   * Check if user has liked a novel comment
   */
  async hasUserLikedNovelComment(userId: number, commentId: number): Promise<boolean> {
    const result = await query(
      `SELECT 1
       FROM novel_comment_likes
       WHERE user_id = $1 AND comment_id = $2
       LIMIT 1`,
      [userId, commentId]
    );
    
    return result.rows.length > 0;
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
   * Get user's novel comments
   */
  async getUserNovelComments(userId: number, page: number = 1, limit: number = 20): Promise<{ comments: NovelComment[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM novel_comments
       WHERE user_id = $1 AND is_deleted = false`,
      [userId]
    );
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get comments
    const commentsResult = await query(
      `SELECT *
       FROM novel_comments
       WHERE user_id = $1 AND is_deleted = false
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    const comments = commentsResult.rows.map(row => this.transformNovelCommentData(row));
    
    return { comments, total };
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
   * Transform database row to NovelComment object
   */
  transformNovelCommentData(row: Record<string, unknown>): NovelComment {
    return {
      id: Number(row.id),
      content: String(row.content),
      userId: Number(row.user_id),
      novelId: Number(row.novel_id),
      parentId: row.parent_id ? Number(row.parent_id) : undefined,
      isEdited: Boolean(row.is_edited),
      isDeleted: Boolean(row.is_deleted),
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string)
    };
  }

  /**
   * Transform database row to ChapterComment object
   */
  private transformChapterCommentData(row: Record<string, unknown>): ChapterComment {
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

  /**
   * Get likes for a novel comment
   */
  async getLikes(commentId: number): Promise<number[]> {
    return this.getNovelCommentLikes(commentId);
  }

  /**
   * Convert camelCase field name to snake_case column name
   */
  convertFieldToColumn(field: string): string {
    // If field already contains underscore, assume it's already in snake_case
    if (field.includes('_')) return field;
    
    // Handle special cases
    if (field === 'createdAt') return 'created_at';
    if (field === 'updatedAt') return 'updated_at';
    if (field === 'userId') return 'user_id';
    if (field === 'novelId') return 'novel_id';
    if (field === 'parentId') return 'parent_id';
    if (field === 'isDeleted') return 'is_deleted';
    
    // Default conversion
    return field.replace(/([A-Z])/g, '_$1').toLowerCase();
  }
}

const commentModel = new CommentModel();
export default commentModel;

// Novel Comment Model
class NovelCommentModelClass {
  /**
   * Create a novel comment
   */
  async create(commentData: Omit<NovelComment, 'id' | 'isEdited' | 'isDeleted' | 'createdAt' | 'updatedAt'>): Promise<NovelComment> {
    return commentModel.createNovelComment(commentData);
  }

  /**
   * Find a novel comment by ID
   */
  async findById(id: number): Promise<NovelComment | null> {
    return commentModel.getNovelCommentById(id);
  }

  /**
   * Find all novel comments with pagination and filtering
   */
  async findAll(page: number = 1, limit: number = 20, options: {
    novelId?: number;
    userId?: number;
    parentId?: number | null;
    isDeleted?: boolean;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
  } = {}): Promise<{ comments: NovelComment[], total: number }> {
    const offset = (page - 1) * limit;
    const sortField = this.convertFieldToColumn(options.sortBy || 'created_at');
    const sortOrder = options.order || 'DESC';
    
    // Build the WHERE clause
    const whereConditions: string[] = [];
    const queryParams: (string | number | boolean)[] = [];
    let paramIndex = 1;
    
    if (options.isDeleted !== undefined) {
      whereConditions.push(`is_deleted = $${paramIndex++}`);
      queryParams.push(options.isDeleted);
    }
    
    if (options.novelId !== undefined) {
      whereConditions.push(`novel_id = $${paramIndex++}`);
      queryParams.push(options.novelId);
    }
    
    if (options.userId !== undefined) {
      whereConditions.push(`user_id = $${paramIndex++}`);
      queryParams.push(options.userId);
    }
    
    if (options.parentId === null) {
      whereConditions.push(`parent_id IS NULL`);
    } else if (options.parentId !== undefined) {
      whereConditions.push(`parent_id = $${paramIndex++}`);
      queryParams.push(options.parentId);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM novel_comments
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Get comments with pagination
    const commentsQuery = `
      SELECT *
      FROM novel_comments
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    const commentsResult = await query(
      commentsQuery,
      [...queryParams, limit, offset]
    );
    
    const comments = commentsResult.rows.map(row => commentModel.transformNovelCommentData(row));
    
    return { comments, total };
  }

  /**
   * Update a novel comment
   */
  async update(id: number, content: string): Promise<NovelComment | null> {
    return commentModel.updateNovelComment(id, content);
  }

  /**
   * Delete a novel comment (soft delete)
   */
  async delete(id: number): Promise<boolean> {
    return commentModel.deleteNovelComment(id);
  }

  /**
   * Like a novel comment
   */
  async like(userId: number, commentId: number): Promise<boolean> {
    return commentModel.likeNovelComment(userId, commentId);
  }

  /**
   * Unlike a novel comment
   */
  async unlike(userId: number, commentId: number): Promise<boolean> {
    return commentModel.unlikeNovelComment(userId, commentId);
  }

  /**
   * Get likes for a novel comment
   */
  async getLikes(commentId: number): Promise<number[]> {
    return commentModel.getNovelCommentLikes(commentId);
  }

  /**
   * Convert camelCase field name to snake_case column name
   */
  convertFieldToColumn(field: string): string {
    // If field already contains underscore, assume it's already in snake_case
    if (field.includes('_')) return field;
    
    // Handle special cases
    if (field === 'createdAt') return 'created_at';
    if (field === 'updatedAt') return 'updated_at';
    if (field === 'userId') return 'user_id';
    if (field === 'novelId') return 'novel_id';
    if (field === 'parentId') return 'parent_id';
    if (field === 'isDeleted') return 'is_deleted';
    
    // Default conversion
    return field.replace(/([A-Z])/g, '_$1').toLowerCase();
  }
}

// Chapter Comment Model
class ChapterCommentModelClass {
  // Similar methods for chapter comments
}

export const NovelCommentModel = new NovelCommentModelClass();
export const ChapterCommentModel = new ChapterCommentModelClass(); 