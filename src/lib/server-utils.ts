import mongoose from 'mongoose';
import { cleanupS3Client } from './s3';

// Prevent running in non-Node.js environments
const isNode = typeof process !== 'undefined' && 
               process.versions != null && 
               process.versions.node != null;

// Variables to track shutdown state
let isShuttingDown = false;

/**
 * Handle graceful shutdowns for multiple termination signals
 * This should only be used in Node.js environment (not Edge)
 */
export const setupGracefulShutdown = () => {
  // Only run in Node.js environment
  if (!isNode) return;
  
  const shutdownGracefully = async (signal: string) => {
    if (isShuttingDown) return; // Prevent multiple shutdown attempts
    
    isShuttingDown = true;
    console.log(`${signal} received. Closing connections...`);
    
    try {
      // Clean up MongoDB connections
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed gracefully');
      }
      
      // Clean up S3 resources
      cleanupS3Client();
      
      process.exit(0);
    } catch (err) {
      console.error('Error during graceful shutdown:', err);
      process.exit(1);
    }
  };

  // Set up signal handlers
  process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
  process.on('SIGINT', () => shutdownGracefully('SIGINT'));
  process.on('SIGHUP', () => shutdownGracefully('SIGHUP'));
};

// This should be called in a server context (e.g., in server.js or a Node.js only entry point)
export const initServerEnvironment = () => {
  // Only run in Node.js environment
  if (!isNode) return;
  
  // Set up graceful shutdown
  setupGracefulShutdown();
}; 