/**
 * Find chapters by novel ID
 */
async findByNovelId(novelId: number): Promise<Chapter[]> {
  const result = await query(
    `SELECT *
     FROM chapters
     WHERE novel_id = $1
     ORDER BY chapter_number ASC`,
    [novelId]
  );
  
  return result.rows.map(row => this.transformChapterData(row));
} 