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

// Comment like interface
export interface CommentLike {
  userId: number;
  commentId: number;
  createdAt: Date;
}

/**
 * NovelCommentModel - Handles all operations related to novel comments
 */
class NovelCommentModel {
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

  /**
   * Find all novel comments with pagination and filtering
   */
  async findAll(page: number = 1, limit: number = 10, options: {
    novelId?: number;
    userId?: number;
    parentId?: number | null;
    isDeleted?: boolean;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
  } = {}): Promise<{ comments: NovelComment[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Build WHERE clause
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    
    if (options.novelId !== undefined) {
      conditions.push(`novel_id = $${paramIndex++}`);
      params.push(options.novelId);
    }
    
    if (options.userId !== undefined) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(options.userId);
    }
    
    if (options.parentId !== undefined) {
      if (options.parentId === null) {
        conditions.push(`parent_id IS NULL`);
      } else {
        conditions.push(`parent_id = $${paramIndex++}`);
        params.push(options.parentId);
      }
    }
    
    if (options.isDeleted !== undefined) {
      conditions.push(`is_deleted = $${paramIndex++}`);
      params.push(options.isDeleted);
    }
    
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';
    
    // Build ORDER BY clause
    const sortField = options.sortBy ? this.convertFieldToColumn(options.sortBy) : 'created_at';
    const sortOrder = options.order || 'DESC';
    const orderClause = `ORDER BY ${sortField} ${sortOrder}`;
    
    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM novel_comments
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    
    // Query comments with pagination
    const commentsQuery = `
      SELECT *
      FROM novel_comments
      ${whereClause}
      ${orderClause}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    const commentsResult = await query(
      commentsQuery, 
      [...params, limit, offset]
    );
    
    const comments = commentsResult.rows.map(row => this.transformNovelCommentData(row));
    
    return { comments, total };
  }

  /**
   * Create a novel comment (alias for createNovelComment)
   */
  async create(commentData: Omit<NovelComment, 'id' | 'isEdited' | 'isDeleted' | 'createdAt' | 'updatedAt'>): Promise<NovelComment> {
    return this.createNovelComment(commentData);
  }
}

// Export a singleton instance
export default new NovelCommentModel(); 