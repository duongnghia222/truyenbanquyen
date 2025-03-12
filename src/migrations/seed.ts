import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Define CSV file paths
const CSV_DIR = path.resolve(__dirname, '../../mongodb-csv-export');
const USER_CSV = path.join(CSV_DIR, 'users.csv');
const NOVEL_CSV = path.join(CSV_DIR, 'novels.csv');
const CHAPTER_CSV = path.join(CSV_DIR, 'chapters.csv');
const COMMENT_CSV = path.join(CSV_DIR, 'comments.csv');
const CHAPTER_COMMENT_CSV = path.join(CSV_DIR, 'chaptercomments.csv');

// MongoDB ObjectId to PostgreSQL ID mapping
const idMap: {
  users: Record<string, number>;
  novels: Record<string, number>;
  chapters: Record<string, number>;
  novelComments: Record<string, number>;
  chapterComments: Record<string, number>;
} = {
  users: {},
  novels: {},
  chapters: {},
  novelComments: {},
  chapterComments: {},
};

// Helper function to parse CSV file
async function parseCSV(filePath: string): Promise<any[]> {
  const data: any[] = [];
  
  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({
      columns: true,
      skip_empty_lines: true,
    }));

  for await (const record of parser) {
    data.push(record);
  }
  
  return data;
}

// Helper function to extract MongoDB ID
function extractMongoId(objectId: string): string {
  // Extract the ID from format like ObjectId(67cb241434ee92dcef560573)
  const match = objectId.match(/ObjectId\(([a-f0-9]+)\)/);
  return match ? match[1] : objectId;
}

// Helper function to parse JSON arrays stored as strings
function parseStringArray(arrayString: string): string[] {
  try {
    return JSON.parse(arrayString);
  } catch (error) {
    return [];
  }
}

// Main seeding function
async function seed() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Seed users
    console.log('Seeding users...');
    const users = await parseCSV(USER_CSV);
    
    for (const user of users) {
      const mongoId = extractMongoId(user._id);
      const { name, username, email, googleId, role, createdAt, updatedAt } = user;
      
      const result = await client.query(
        `INSERT INTO users(name, username, email, google_id, role, created_at, updated_at)
         VALUES($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [name, username, email, googleId || null, role, createdAt, updatedAt]
      );
      
      idMap.users[mongoId] = result.rows[0].id;
    }
    
    // 2. Seed genres and novels
    console.log('Seeding novels and genres...');
    const novels = await parseCSV(NOVEL_CSV);
    
    // Create a set of unique genres
    const uniqueGenres = new Set<string>();
    novels.forEach(novel => {
      const genres = parseStringArray(novel.genres);
      genres.forEach(genre => uniqueGenres.add(genre));
    });
    
    // Insert genres
    const genresMap: Record<string, number> = {};
    for (const genre of uniqueGenres) {
      const result = await client.query(
        'INSERT INTO genres(name) VALUES($1) RETURNING id',
        [genre]
      );
      genresMap[genre] = result.rows[0].id;
    }
    
    // Insert novels
    for (const novel of novels) {
      const mongoId = extractMongoId(novel._id);
      const { 
        title, slug, author, description, coverImage, status, 
        rating, views, chapterCount, createdAt, updatedAt 
      } = novel;
      const uploadedBy = idMap.users[extractMongoId(novel.uploadedBy)];
      
      const result = await client.query(
        `INSERT INTO novels(
          title, slug, author, description, cover_image, status, 
          uploaded_by, rating, views, chapter_count, created_at, updated_at
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id`,
        [
          title, slug, author, description, coverImage, status, 
          uploadedBy, parseFloat(rating || 0), parseInt(views || 0), 
          parseInt(chapterCount || 0), createdAt, updatedAt
        ]
      );
      
      idMap.novels[mongoId] = result.rows[0].id;
      
      // Add novel genres
      const genres = parseStringArray(novel.genres);
      for (const genre of genres) {
        if (genresMap[genre]) {
          await client.query(
            'INSERT INTO novel_genres(novel_id, genre_id) VALUES($1, $2)',
            [result.rows[0].id, genresMap[genre]]
          );
        }
      }
    }
    
    // 3. Seed chapters
    console.log('Seeding chapters...');
    const chapters = await parseCSV(CHAPTER_CSV);
    
    for (const chapter of chapters) {
      const mongoId = extractMongoId(chapter._id);
      const { 
        chapterNumber, title, contentUrl, views, createdAt, updatedAt 
      } = chapter;
      const novelId = idMap.novels[extractMongoId(chapter.novelId)];
      
      if (!novelId) {
        console.warn(`Novel ID not found for chapter: ${mongoId}`);
        continue;
      }
      
      const result = await client.query(
        `INSERT INTO chapters(
          novel_id, chapter_number, title, content_url, views, created_at, updated_at
        ) VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
        [
          novelId, parseInt(chapterNumber), title, contentUrl, 
          parseInt(views || 0), createdAt, updatedAt
        ]
      );
      
      idMap.chapters[mongoId] = result.rows[0].id;
    }
    
    // 4. Seed novel comments
    console.log('Seeding novel comments...');
    const comments = await parseCSV(COMMENT_CSV);
    
    // First pass: Insert comments without parent relationship
    for (const comment of comments) {
      const mongoId = extractMongoId(comment._id);
      const { 
        content, isEdited, isDeleted, createdAt, updatedAt 
      } = comment;
      const userId = idMap.users[extractMongoId(comment.user)];
      const novelId = idMap.novels[extractMongoId(comment.novel)];
      
      if (!userId || !novelId) {
        console.warn(`User or Novel ID not found for comment: ${mongoId}`);
        continue;
      }
      
      const result = await client.query(
        `INSERT INTO novel_comments(
          content, user_id, novel_id, is_edited, is_deleted, created_at, updated_at
        ) VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
        [
          content, userId, novelId, 
          isEdited === 'true', isDeleted === 'true', 
          createdAt, updatedAt
        ]
      );
      
      idMap.novelComments[mongoId] = result.rows[0].id;
    }
    
    // Second pass: Update parent references
    for (const comment of comments) {
      if (comment.parent) {
        const commentId = idMap.novelComments[extractMongoId(comment._id)];
        const parentId = idMap.novelComments[extractMongoId(comment.parent)];
        
        if (commentId && parentId) {
          await client.query(
            'UPDATE novel_comments SET parent_id = $1 WHERE id = $2',
            [parentId, commentId]
          );
        }
      }
    }
    
    // 5. Seed chapter comments
    console.log('Seeding chapter comments...');
    const chapterComments = await parseCSV(CHAPTER_COMMENT_CSV);
    
    // First pass: Insert comments without parent relationship
    for (const comment of chapterComments) {
      const mongoId = extractMongoId(comment._id);
      const { 
        content, isEdited, isDeleted, createdAt, updatedAt 
      } = comment;
      const userId = idMap.users[extractMongoId(comment.user)];
      const novelId = idMap.novels[extractMongoId(comment.novel)];
      const chapterId = idMap.chapters[extractMongoId(comment.chapter)];
      
      if (!userId || !novelId || !chapterId) {
        console.warn(`User, Novel or Chapter ID not found for comment: ${mongoId}`);
        continue;
      }
      
      const result = await client.query(
        `INSERT INTO chapter_comments(
          content, user_id, novel_id, chapter_id, is_edited, is_deleted, created_at, updated_at
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          content, userId, novelId, chapterId,
          isEdited === 'true', isDeleted === 'true', 
          createdAt, updatedAt
        ]
      );
      
      idMap.chapterComments[mongoId] = result.rows[0].id;
    }
    
    // Second pass: Update parent references
    for (const comment of chapterComments) {
      if (comment.parent) {
        const commentId = idMap.chapterComments[extractMongoId(comment._id)];
        const parentId = idMap.chapterComments[extractMongoId(comment.parent)];
        
        if (commentId && parentId) {
          await client.query(
            'UPDATE chapter_comments SET parent_id = $1 WHERE id = $2',
            [parentId, commentId]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    console.log('Seeding completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed function
seed().catch(console.error); 