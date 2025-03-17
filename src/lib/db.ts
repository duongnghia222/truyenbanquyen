import { Pool } from 'pg';
import connectDB from './postgresql';

// Helper function to check if a request is for a static asset
export function isStaticAsset(path: string): boolean {
  const staticExtensions = [
    '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', 
    '.css', '.js', '.woff', '.woff2', '.ttf', '.eot'
  ];
  
  return staticExtensions.some(ext => path.endsWith(ext));
}

/**
 * Initialize database connection
 */
export async function initDatabase() {
  try {
    const pool = await connectDB();
    console.log('✅ PostgreSQL connected successfully');
    return pool;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    throw error;
  }
}

/**
 * Ensures database connection is active
 */
export async function ensureDatabaseConnection() {
  try {
    // This will get the existing pool or create a new one
    await connectDB();
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return false;
  }
}