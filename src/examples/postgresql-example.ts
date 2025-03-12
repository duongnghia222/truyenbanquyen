/**
 * Example usage of PostgreSQL models
 * 
 * This file demonstrates how to use the PostgreSQL models in your application.
 * It's not meant to be executed directly, but serves as a reference.
 */

import { 
  UserModel, 
  NovelModel, 
  ChapterModel, 
  CommentModel,
  type Novel,
  type Chapter,
  type User
} from '../models/postgresql';

/**
 * User registration example
 */
async function registerUser(
  name: string,
  username: string,
  email: string,
  password: string
): Promise<User> {
  try {
    // Check if username is already taken
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already taken');
    }
    
    // Check if email is already registered
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }
    
    // Create new user
    const newUser = await UserModel.create({
      name,
      username,
      email,
      password,
      role: 'user'
    });
    
    return newUser;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

/**
 * User login example
 */
async function loginUser(email: string, password: string): Promise<User> {
  try {
    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check password
    const isPasswordValid = await UserModel.comparePassword(user.id, password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    return user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

/**
 * Create novel example
 */
async function createNovel(
  title: string,
  author: string,
  description: string,
  coverImage: string,
  genres: string[],
  uploadedBy: number
): Promise<Novel> {
  try {
    const novel = await NovelModel.create({
      title,
      author,
      description,
      coverImage,
      genres,
      status: 'ongoing',
      uploadedBy
    });
    
    return novel;
  } catch (error) {
    console.error('Error creating novel:', error);
    throw error;
  }
}

/**
 * Add chapter example
 */
async function addChapter(
  novelId: number,
  title: string,
  contentUrl: string
): Promise<Chapter> {
  try {
    // Get the next chapter number
    const chapters = await ChapterModel.findByNovelId(novelId);
    const chapterNumber = chapters.length + 1;
    
    // Create the chapter
    const chapter = await ChapterModel.create({
      novelId,
      chapterNumber,
      title,
      contentUrl
    });
    
    return chapter;
  } catch (error) {
    console.error('Error adding chapter:', error);
    throw error;
  }
}

/**
 * Add comment example
 */
async function addNovelComment(
  content: string,
  userId: number,
  novelId: number
) {
  try {
    const comment = await CommentModel.createNovelComment({
      content,
      userId,
      novelId
    });
    
    return comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Search novels example
 */
async function searchNovels(keyword: string, page: number = 1) {
  try {
    const result = await NovelModel.search(keyword, page);
    return result;
  } catch (error) {
    console.error('Error searching novels:', error);
    throw error;
  }
}

/**
 * Get user reading history example
 */
async function getUserReadingHistory(userId: number) {
  try {
    const readingHistory = await UserModel.getReadingHistory(userId);
    
    // Get novel and chapter details for each history item
    const detailedHistory = await Promise.all(
      readingHistory.map(async (item) => {
        const novel = await NovelModel.findById(item.novelId);
        let chapter = null;
        
        if (item.lastChapterId) {
          chapter = await ChapterModel.findById(item.lastChapterId);
        }
        
        return {
          ...item,
          novel,
          chapter
        };
      })
    );
    
    return detailedHistory;
  } catch (error) {
    console.error('Error getting user reading history:', error);
    throw error;
  }
}

export {
  registerUser,
  loginUser,
  createNovel,
  addChapter,
  addNovelComment,
  searchNovels,
  getUserReadingHistory
}; 