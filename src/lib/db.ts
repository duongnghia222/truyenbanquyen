import mongoose from 'mongoose';
import connectDB from './mongodb';
import { cleanupS3Client } from './s3';

let hasShownConnectionMessage = false;
let isShuttingDown = false;
let connectionAttemptTimestamp = 0;
const CONNECTION_COOLDOWN_MS = 1000; // Prevent excessive connection attempts

export async function initDatabase() {
  try {
    const now = Date.now();
    // Add cooldown to prevent multiple connection attempts in quick succession
    if (now - connectionAttemptTimestamp < CONNECTION_COOLDOWN_MS) {
      // If we tried to connect very recently, just wait for that connection
      return mongoose.connection.readyState === 1 ? mongoose : await connectDB();
    }
    
    connectionAttemptTimestamp = now;
    
    // Check if we already have an active connection
    if (mongoose.connection.readyState === 1) {
      if (!hasShownConnectionMessage) {
        console.log('✅ MongoDB connection already active');
        hasShownConnectionMessage = true;
      }
      return mongoose;
    }
    
    await connectDB();
    if (!hasShownConnectionMessage) {
      console.log('✅ MongoDB connected successfully');
      hasShownConnectionMessage = true;
    }
    return mongoose;
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

// Additional helper function for serverless environments
export async function ensureDatabaseConnection() {
  // Check connection state
  if (mongoose.connection.readyState === 1) {
    // Connection is established and ready
    return true;
  } else if (mongoose.connection.readyState === 2) {
    // Connection is in progress, wait for it
    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          mongoose.connection.removeListener('connected', onConnect);
          reject(new Error('Connection timeout'));
        }, 10000);
        
        function onConnect() {
          clearTimeout(timeout);
          mongoose.connection.removeListener('error', onError);
          resolve(true);
        }
        
        function onError(err: Error) {
          clearTimeout(timeout);
          mongoose.connection.removeListener('connected', onConnect);
          reject(err);
        }
        
        mongoose.connection.once('connected', onConnect);
        mongoose.connection.once('error', onError);
      });
      return true;
    } catch (error) {
      console.error('Error waiting for connection:', error);
      return initDatabase().then(() => true);
    }
  } else {
    // No connection or failed connection, initialize
    await initDatabase();
    return true;
  }
}

// Handle various termination signals for graceful shutdown
process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
process.on('SIGINT', () => shutdownGracefully('SIGINT'));
process.on('SIGHUP', () => shutdownGracefully('SIGHUP'));