import mongoose from 'mongoose';
import { cleanupS3Client } from './s3';

// Prevent running in non-Node.js environments
const isNode = typeof process !== 'undefined' && 
               process.versions != null && 
               process.versions.node != null;

// Variables to track shutdown state
let isShuttingDown = false;
let shutdownTimeout: NodeJS.Timeout | null = null;

/**
 * Handle graceful shutdowns for multiple termination signals
 * This should only be used in Node.js environment (not Edge)
 */
export const setupGracefulShutdown = () => {
  // Only run in Node.js environment
  if (!isNode) return;
  
  const shutdownGracefully = async (signal: string) => {
    if (isShuttingDown) {
      console.log('Shutdown already in progress, waiting...');
      return; // Prevent multiple shutdown attempts
    }
    
    isShuttingDown = true;
    console.log(`${signal} received. Closing connections...`);
    
    // Set a timeout to force exit if graceful shutdown takes too long
    shutdownTimeout = setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000); // 10 seconds timeout
    
    try {
      // Clean up MongoDB connections
      if (mongoose.connection.readyState === 1) {
        console.log('Closing MongoDB connection...');
        await mongoose.connection.close(false); // false = don't force close
        console.log('MongoDB connection closed gracefully');
      }
      
      // Clean up S3 resources
      cleanupS3Client();
      
      // Clear the timeout since we're exiting cleanly
      if (shutdownTimeout) {
        clearTimeout(shutdownTimeout);
        shutdownTimeout = null;
      }
      
      console.log('All connections closed, exiting process');
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
  
  // Handle uncaught exceptions and unhandled rejections
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    shutdownGracefully('UNCAUGHT_EXCEPTION');
  });
  
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
    // Don't exit for unhandled rejections, just log them
  });
};

// This should be called in a server context (e.g., in server.js or a Node.js only entry point)
export const initServerEnvironment = () => {
  // Only run in Node.js environment
  if (!isNode) return;
  
  // Set up graceful shutdown
  setupGracefulShutdown();
  
  console.log('Server environment initialized with improved shutdown handling');
}; 