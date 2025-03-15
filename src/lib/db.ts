import mongoose from 'mongoose';
import connectDB from './mongodb';

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
  // If already connected, return the connection
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    return mongoose;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Ensures database connection is active
 */
export async function ensureDatabaseConnection() {
  const connectionState = mongoose.connection.readyState;
  
  // If connected, return
  if (connectionState === 1) {
    return true;
  }
  
  // In any other state, initialize the database
  try {
    await initDatabase();
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return false;
  }
}