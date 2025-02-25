import mongoose from 'mongoose';
import connectDB from './mongodb';
import { cleanupS3Client } from './s3';

let hasShownConnectionMessage = false;
let isShuttingDown = false;

export async function initDatabase() {
  try {
    await connectDB();
    if (!hasShownConnectionMessage) {
      console.log('✅ MongoDB connected successfully');
      hasShownConnectionMessage = true;
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Retry logic with exponential backoff if we're not in a shutdown state
    if (!isShuttingDown) {
      const retryDelay = 5000; // 5 seconds
      console.log(`Retrying connection in ${retryDelay / 1000} seconds...`);
      setTimeout(initDatabase, retryDelay);
    }
    throw error;
  }
}

// Handle graceful shutdowns for multiple termination signals
const shutdownGracefully = async (signal: string) => {
  if (isShuttingDown) return; // Prevent multiple shutdown attempts
  
  isShuttingDown = true;
  console.log(`${signal} received. Closing connections...`);
  
  try {
    // Clean up MongoDB connections
    await mongoose.connection.close();
    console.log('MongoDB connection closed gracefully');
    
    // Clean up S3 resources
    cleanupS3Client();
    
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
};

// Handle various termination signals for graceful shutdown
process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
process.on('SIGINT', () => shutdownGracefully('SIGINT'));
process.on('SIGHUP', () => shutdownGracefully('SIGHUP'));