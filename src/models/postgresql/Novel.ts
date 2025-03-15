import { query, transaction } from '../../config/database';
import { transliterateVietnamese } from '../../lib/utils';
import { NovelStatus } from '@/types/novel';

// PostgreSQL-specific Novel type definition
export interface Novel {
  id: number;
  title: string;
  slug: string;
  author: string;
  description: string;
  coverImage: string;
  genres: string[];
  status: NovelStatus;
  uploadedBy: number;
  rating: number;
  views: number;
  chapterCount: number;
  createdAt: Date;
  updatedAt: Date;
}

class NovelModel {
  /**
   * Create a new novel
   */
  async create(novelData: Omit<Novel, 'id' | 'slug' | 'rating' | 'views' | 'chapterCount' | 'createdAt' | 'updatedAt'>): Promise<Novel> {
    return await transaction(async (client) => {
      // Generate slug from title
      const slug = this.generateSlug(novelData.title);

      // Insert novel
      const novelResult = await client.query(
        `INSERT INTO novels (
          title, slug, author, description, cover_image, 
          status, uploaded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          novelData.title,
          slug,
          novelData.author,
          novelData.description,
          novelData.coverImage,
          novelData.status || 'ongoing',
          novelData.uploadedBy
        ]
      );

      const novel = novelResult.rows[0];

      // Insert genres (ensuring they exist first)
      for (const genreName of novelData.genres) {
        // Create genre if it doesn't exist
        await client.query(
          `INSERT INTO genres (name)
           VALUES ($1)
           ON CONFLICT (name) DO NOTHING`,
          [genreName]
        );

        // Get genre id
        const genreResult = await client.query(
          'SELECT id FROM genres WHERE name = $1',
          [genreName]
        );
        
        const genreId = genreResult.rows[0].id;

        // Link genre to novel
        await client.query(
          `INSERT INTO novel_genres (novel_id, genre_id)
           VALUES ($1, $2)`,
          [novel.id, genreId]
        );
      }

      // Return novel with all fields
      return this.transformNovelData(novel, novelData.genres);
    });
  }

  /**
   * Find a novel by ID
   */
  async findById(id: number): Promise<Novel | null> {
    const novelResult = await query(
      'SELECT * FROM novels WHERE id = $1',
      [id]
    );

    if (novelResult.rows.length === 0) {
      return null;
    }

    const novel = novelResult.rows[0];
    const genres = await this.getNovelGenres(id);

    return this.transformNovelData(novel, genres);
  }

  /**
   * Find a novel by slug
   */
  async findBySlug(slug: string): Promise<Novel | null> {
    const novelResult = await query(
      'SELECT * FROM novels WHERE slug = $1',
      [slug]
    );

    if (novelResult.rows.length === 0) {
      return null;
    }

    const novel = novelResult.rows[0];
    const genres = await this.getNovelGenres(novel.id);

    return this.transformNovelData(novel, genres);
  }

  /**
   * Get all novels with pagination
   */
  async findAll(page: number = 1, limit: number = 20, sortBy: string = 'created_at', order: 'ASC' | 'DESC' = 'DESC'): Promise<{ novels: Novel[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Validate sortBy to prevent SQL injection
    const validSortColumns = ['created_at', 'updated_at', 'title', 'views', 'rating'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    
    // Get total count
    const countResult = await query('SELECT COUNT(*) as total FROM novels');
    const total = parseInt(countResult.rows[0].total);
    
    // Get novels
    const novelsResult = await query(
      `SELECT * FROM novels
       ORDER BY ${sortColumn} ${order}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    // Get genres for each novel
    const novels = await Promise.all(
      novelsResult.rows.map(async (novel) => {
        const genres = await this.getNovelGenres(novel.id);
        return this.transformNovelData(novel, genres);
      })
    );
    
    return { novels, total };
  }

  /**
   * Update a novel
   */
  async update(id: number, novelData: Partial<Novel>): Promise<Novel | null> {
    return await transaction(async (client) => {
      // Start building the update query
      let updateQuery = 'UPDATE novels SET ';
      const queryParams: any[] = [];
      const updateFields: string[] = [];
      let paramIndex = 1;

      // Add each field that needs to be updated
      if (novelData.title !== undefined) {
        updateFields.push(`title = $${paramIndex++}`);
        queryParams.push(novelData.title);
        
        // Update slug if title changes
        const slug = this.generateSlug(novelData.title);
        updateFields.push(`slug = $${paramIndex++}`);
        queryParams.push(slug);
      }

      if (novelData.author !== undefined) {
        updateFields.push(`author = $${paramIndex++}`);
        queryParams.push(novelData.author);
      }

      if (novelData.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        queryParams.push(novelData.description);
      }

      if (novelData.coverImage !== undefined) {
        updateFields.push(`cover_image = $${paramIndex++}`);
        queryParams.push(novelData.coverImage);
      }

      if (novelData.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        queryParams.push(novelData.status);
      }

      // Always update the updated_at timestamp
      updateFields.push(`updated_at = NOW()`);

      // Finalize the query
      updateQuery += updateFields.join(', ');
      updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
      queryParams.push(id);

      // Only run the update if we have fields to update
      if (updateFields.length === 1 && updateFields[0] === 'updated_at = NOW()') {
        // If we're only updating the timestamp, just get the current novel
        const currentNovel = await client.query(
          'SELECT * FROM novels WHERE id = $1',
          [id]
        );
        
        if (currentNovel.rows.length === 0) {
          return null;
        }
        
        const novel = currentNovel.rows[0];
        
        // Update genres if provided
        if (novelData.genres !== undefined) {
          // Clear existing genres
          await client.query(
            'DELETE FROM novel_genres WHERE novel_id = $1',
            [id]
          );
          
          // Add new genres
          for (const genreName of novelData.genres) {
            // Create genre if it doesn't exist
            await client.query(
              `INSERT INTO genres (name)
               VALUES ($1)
               ON CONFLICT (name) DO NOTHING`,
              [genreName]
            );
            
            // Get genre id
            const genreResult = await client.query(
              'SELECT id FROM genres WHERE name = $1',
              [genreName]
            );
            
            const genreId = genreResult.rows[0].id;
            
            // Link genre to novel
            await client.query(
              `INSERT INTO novel_genres (novel_id, genre_id)
               VALUES ($1, $2)`,
              [id, genreId]
            );
          }
        }
        
        const genres = await this.getNovelGenres(id);
        return this.transformNovelData(novel, genres);
      }

      // Run the update
      const result = await client.query(updateQuery, queryParams);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const novel = result.rows[0];
      
      // Update genres if provided
      if (novelData.genres !== undefined) {
        // Clear existing genres
        await client.query(
          'DELETE FROM novel_genres WHERE novel_id = $1',
          [id]
        );
        
        // Add new genres
        for (const genreName of novelData.genres) {
          // Create genre if it doesn't exist
          await client.query(
            `INSERT INTO genres (name)
             VALUES ($1)
             ON CONFLICT (name) DO NOTHING`,
            [genreName]
          );
          
          // Get genre id
          const genreResult = await client.query(
            'SELECT id FROM genres WHERE name = $1',
            [genreName]
          );
          
          const genreId = genreResult.rows[0].id;
          
          // Link genre to novel
          await client.query(
            `INSERT INTO novel_genres (novel_id, genre_id)
             VALUES ($1, $2)`,
            [id, genreId]
          );
        }
      }
      
      const genres = await this.getNovelGenres(id);
      return this.transformNovelData(novel, genres);
    });
  }

  /**
   * Delete a novel
   */
  async delete(id: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM novels WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rows.length > 0;
  }

  /**
   * Increment the view count for a novel
   */
  async incrementViews(id: number): Promise<void> {
    await query(
      'UPDATE novels SET views = views + 1 WHERE id = $1',
      [id]
    );
  }

  /**
   * Update chapter count
   */
  async updateChapterCount(id: number): Promise<void> {
    await query(
      `UPDATE novels 
       SET chapter_count = (
         SELECT COUNT(*) FROM chapters WHERE novel_id = $1
       )
       WHERE id = $1`,
      [id]
    );
  }

  /**
   * Find novels by genre
   */
  async findByGenre(genreName: string, page: number = 1, limit: number = 20): Promise<{ novels: Novel[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await query(
      `SELECT COUNT(DISTINCT n.id) as total
       FROM novels n
       JOIN novel_genres ng ON n.id = ng.novel_id
       JOIN genres g ON ng.genre_id = g.id
       WHERE g.name = $1`,
      [genreName]
    );
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get novels
    const novelsResult = await query(
      `SELECT DISTINCT n.*
       FROM novels n
       JOIN novel_genres ng ON n.id = ng.novel_id
       JOIN genres g ON ng.genre_id = g.id
       WHERE g.name = $1
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
      [genreName, limit, offset]
    );
    
    // Get genres for each novel
    const novels = await Promise.all(
      novelsResult.rows.map(async (novel) => {
        const genres = await this.getNovelGenres(novel.id);
        return this.transformNovelData(novel, genres);
      })
    );
    
    return { novels, total };
  }

  /**
   * Search novels by keyword
   */
  async search(keyword: string, page: number = 1, limit: number = 20): Promise<{ novels: Novel[], total: number }> {
    const offset = (page - 1) * limit;
    const searchTerm = `%${keyword}%`;
    
    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM novels
       WHERE title ILIKE $1 OR author ILIKE $1 OR description ILIKE $1`,
      [searchTerm]
    );
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get novels
    const novelsResult = await query(
      `SELECT *
       FROM novels
       WHERE title ILIKE $1 OR author ILIKE $1 OR description ILIKE $1
       ORDER BY 
         CASE 
           WHEN title ILIKE $1 THEN 0
           WHEN author ILIKE $1 THEN 1
           ELSE 2
         END,
         created_at DESC
       LIMIT $2 OFFSET $3`,
      [searchTerm, limit, offset]
    );
    
    // Get genres for each novel
    const novels = await Promise.all(
      novelsResult.rows.map(async (novel) => {
        const genres = await this.getNovelGenres(novel.id);
        return this.transformNovelData(novel, genres);
      })
    );
    
    return { novels, total };
  }

  /**
   * Get all available genres
   */
  async getAllGenres(): Promise<string[]> {
    const result = await query(
      'SELECT name FROM genres ORDER BY name'
    );
    
    return result.rows.map(row => row.name);
  }

  /**
   * Find novels by uploader
   */
  async findByUploader(userId: number, page: number = 1, limit: number = 20): Promise<{ novels: Novel[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM novels WHERE uploaded_by = $1',
      [userId]
    );
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get novels
    const novelsResult = await query(
      `SELECT * FROM novels
       WHERE uploaded_by = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    // Get genres for each novel
    const novels = await Promise.all(
      novelsResult.rows.map(async (novel) => {
        const genres = await this.getNovelGenres(novel.id);
        return this.transformNovelData(novel, genres);
      })
    );
    
    return { novels, total };
  }

  /**
   * Get novel genres
   */
  private async getNovelGenres(novelId: number): Promise<string[]> {
    const result = await query(
      `SELECT g.name
       FROM genres g
       JOIN novel_genres ng ON g.id = ng.genre_id
       WHERE ng.novel_id = $1
       ORDER BY g.name`,
      [novelId]
    );
    
    return result.rows.map(row => row.name);
  }

  /**
   * Generate a slug from a title
   */
  private generateSlug(title: string): string {
    // First transliterate Vietnamese characters to Latin equivalents
    const transliterated = transliterateVietnamese(title);
    
    return transliterated
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  }

  /**
   * Transform database row to Novel object
   */
  private transformNovelData(row: any, genres: string[]): Novel {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      author: row.author,
      description: row.description,
      coverImage: row.cover_image,
      genres: genres,
      status: row.status,
      uploadedBy: row.uploaded_by,
      rating: parseFloat(row.rating), // Convert from DECIMAL to number
      views: row.views,
      chapterCount: row.chapter_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export default new NovelModel(); 