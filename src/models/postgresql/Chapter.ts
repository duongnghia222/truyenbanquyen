import { query, transaction } from '../../config/database';
import NovelModel from './Novel';

// Chapter type definition
export interface Chapter {
  id: number;
  novelId: number;
  chapterNumber: number;
  title: string;
  contentUrl: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

class ChapterModel {
  /**
   * Create a new chapter
   */
  async create(chapterData: Omit<Chapter, 'id' | 'views' | 'createdAt' | 'updatedAt'>): Promise<Chapter> {
    let createdChapter: Chapter | null = null;
    
    await transaction(async (client) => {
      // Insert the chapter
      const result = await client.query(
        `INSERT INTO chapters (novel_id, chapter_number, title, content_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          chapterData.novelId,
          chapterData.chapterNumber,
          chapterData.title,
          chapterData.contentUrl
        ]
      );
      
      const chapter = result.rows[0];
      
      // Update novel's chapter count
      await client.query(
        `UPDATE novels 
         SET chapter_count = (
           SELECT COUNT(*) FROM chapters WHERE novel_id = $1
         ),
         updated_at = NOW()
         WHERE id = $1`,
        [chapterData.novelId]
      );
      
      createdChapter = this.transformChapterData(chapter);
    });
    
    if (!createdChapter) {
      throw new Error('Failed to create chapter');
    }
    
    return createdChapter;
  }

  /**
   * Find a chapter by ID
   */
  async findById(id: number): Promise<Chapter | null> {
    const result = await query(
      'SELECT * FROM chapters WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformChapterData(result.rows[0]);
  }

  /**
   * Find chapters by novel ID
   */
  async findByNovelId(novelId: number, sortOrder: 'ASC' | 'DESC' = 'ASC'): Promise<Chapter[]> {
    const result = await query(
      `SELECT * FROM chapters 
       WHERE novel_id = $1 
       ORDER BY chapter_number ${sortOrder}`,
      [novelId]
    );
    
    return result.rows.map(row => this.transformChapterData(row));
  }

  /**
   * Find a chapter by novel ID and chapter number
   */
  async findByNovelIdAndChapterNumber(novelId: number, chapterNumber: number): Promise<Chapter | null> {
    const result = await query(
      'SELECT * FROM chapters WHERE novel_id = $1 AND chapter_number = $2',
      [novelId, chapterNumber]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformChapterData(result.rows[0]);
  }

  /**
   * Get the first chapter of a novel
   */
  async getFirstChapter(novelId: number): Promise<Chapter | null> {
    const result = await query(
      'SELECT * FROM chapters WHERE novel_id = $1 ORDER BY chapter_number ASC LIMIT 1',
      [novelId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformChapterData(result.rows[0]);
  }

  /**
   * Get the latest chapter of a novel
   */
  async getLatestChapter(novelId: number): Promise<Chapter | null> {
    const result = await query(
      'SELECT * FROM chapters WHERE novel_id = $1 ORDER BY chapter_number DESC LIMIT 1',
      [novelId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformChapterData(result.rows[0]);
  }

  /**
   * Get the next chapter
   */
  async getNextChapter(novelId: number, currentChapterNumber: number): Promise<Chapter | null> {
    const result = await query(
      `SELECT * FROM chapters 
       WHERE novel_id = $1 AND chapter_number > $2 
       ORDER BY chapter_number ASC LIMIT 1`,
      [novelId, currentChapterNumber]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformChapterData(result.rows[0]);
  }

  /**
   * Get the previous chapter
   */
  async getPreviousChapter(novelId: number, currentChapterNumber: number): Promise<Chapter | null> {
    const result = await query(
      `SELECT * FROM chapters 
       WHERE novel_id = $1 AND chapter_number < $2 
       ORDER BY chapter_number DESC LIMIT 1`,
      [novelId, currentChapterNumber]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformChapterData(result.rows[0]);
  }

  /**
   * Update a chapter
   */
  async update(id: number, chapterData: Partial<Omit<Chapter, 'id' | 'novelId' | 'createdAt' | 'updatedAt'>>): Promise<Chapter | null> {
    // Start building the update query
    let updateQuery = 'UPDATE chapters SET ';
    const queryParams: (string | number | Date)[] = [];
    const updateFields: string[] = [];
    let paramIndex = 1;
    
    // Add each field that needs to be updated
    if (chapterData.chapterNumber !== undefined) {
      updateFields.push(`chapter_number = $${paramIndex++}`);
      queryParams.push(chapterData.chapterNumber);
    }
    
    if (chapterData.title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      queryParams.push(chapterData.title);
    }
    
    if (chapterData.contentUrl !== undefined) {
      updateFields.push(`content_url = $${paramIndex++}`);
      queryParams.push(chapterData.contentUrl);
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = NOW()`);
    
    // Finalize the query
    updateQuery += updateFields.join(', ');
    updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
    queryParams.push(id);
    
    // Execute the query
    const result = await query(updateQuery, queryParams);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformChapterData(result.rows[0]);
  }

  /**
   * Delete a chapter
   */
  async delete(id: number): Promise<boolean> {
    let success = false;
    
    await transaction(async (client) => {
      // Get the novel ID before deleting
      const chapterResult = await client.query(
        'SELECT novel_id FROM chapters WHERE id = $1',
        [id]
      );
      
      if (chapterResult.rows.length === 0) {
        return;
      }
      
      const novelId = chapterResult.rows[0].novel_id;
      
      // Delete the chapter
      const deleteResult = await client.query(
        'DELETE FROM chapters WHERE id = $1 RETURNING id',
        [id]
      );
      
      if (deleteResult.rows.length === 0) {
        return;
      }
      
      // Update novel's chapter count
      await client.query(
        `UPDATE novels 
         SET chapter_count = (
           SELECT COUNT(*) FROM chapters WHERE novel_id = $1
         ),
         updated_at = NOW()
         WHERE id = $1`,
        [novelId]
      );
      
      success = true;
    });
    
    return success;
  }

  /**
   * Increment the view count for a chapter
   */
  async incrementViews(id: number): Promise<void> {
    await query(
      'UPDATE chapters SET views = views + 1 WHERE id = $1',
      [id]
    );
    
    // Also increment novel views
    const chapterResult = await query(
      'SELECT novel_id FROM chapters WHERE id = $1',
      [id]
    );
    
    if (chapterResult.rows.length > 0) {
      const novelId = chapterResult.rows[0].novel_id;
      await NovelModel.incrementViews(novelId);
    }
  }

  /**
   * Count chapters for a novel
   */
  async countByNovelId(novelId: number): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as count FROM chapters WHERE novel_id = $1',
      [novelId]
    );
    
    return parseInt(result.rows[0].count);
  }

  /**
   * Transform database row to Chapter object
   */
  private transformChapterData(row: Record<string, unknown>): Chapter {
    return {
      id: Number(row.id),
      novelId: Number(row.novel_id),
      chapterNumber: Number(row.chapter_number),
      title: String(row.title),
      contentUrl: String(row.content_url),
      views: Number(row.views),
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string)
    };
  }
}

const chapterModel = new ChapterModel();
export default chapterModel; 