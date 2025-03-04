import mongoose from 'mongoose';
import connectDB from './mongodb';

let hasShownConnectionMessage = false;
let isShuttingDown = false;
let isConnecting = false;
let connectionAttemptTimestamp = 0;
// Reduced cooldown for EC2 environments
const CONNECTION_COOLDOWN_MS = 500;

// Helper function to check if a request is for a static asset
export function isStaticAsset(path: string): boolean {
  const staticExtensions = [
    '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', 
    '.css', '.js', '.woff', '.woff2', '.ttf', '.eot'
  ];
  
  return staticExtensions.some(ext => path.endsWith(ext));
}

export async function initDatabase() {
  try {
    // If we're already connected, just return the connection
    if (mongoose.connection.readyState === 1) {
      if (!hasShownConnectionMessage) {
        console.log('✅ MongoDB connection already active');
        hasShownConnectionMessage = true;
      }
      return mongoose;
    }
    
    // If a connection is in progress, wait for it to complete
    if (isConnecting) {
      const connectionPromise = mongoose.connection.asPromise();
      await connectionPromise;
      return mongoose;
    }
    
    const now = Date.now();
    // Prevent excessive connection attempts with a short cooldown
    if (now - connectionAttemptTimestamp < CONNECTION_COOLDOWN_MS) {
      await new Promise(resolve => setTimeout(resolve, CONNECTION_COOLDOWN_MS));
    }
    
    // Track that we're starting a connection
    connectionAttemptTimestamp = Date.now();
    isConnecting = true;
    
    try {
      await connectDB();
      if (!hasShownConnectionMessage) {
        console.log('✅ MongoDB connected successfully');
        hasShownConnectionMessage = true;
      }
      return mongoose;
    } finally {
      isConnecting = false;
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Retry logic with exponential backoff if we're not in a shutdown state
    if (!isShuttingDown) {
      const retryDelay = 3000; // 3 seconds (faster for EC2)
      console.log(`Retrying connection in ${retryDelay / 1000} seconds...`);
      setTimeout(initDatabase, retryDelay);
    }
    throw error;
  }
}

// Optimized for EC2 environments with better state handling
export async function ensureDatabaseConnection() {
  // Check connection state
  const connectionState = mongoose.connection.readyState;
  
  switch (connectionState) {
    case 1: // Connected
      return true;
      
    case 2: // Connecting
      try {
        // Wait for connection to complete with a reasonable timeout
        const connectionPromise = new Promise<boolean>((resolve, reject) => {
          // Set timeout for waiting
          const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Connection timeout exceeded'));
          }, 5000);
          
          // Cleanup function to remove listeners
          const cleanup = () => {
            clearTimeout(timeout);
            mongoose.connection.removeListener('connected', onConnected);
            mongoose.connection.removeListener('error', onError);
          };
          
          // Event handlers
          function onConnected() {
            cleanup();
            resolve(true);
          }
          
          function onError(err: Error) {
            cleanup();
            reject(err);
          }
          
          // Set up listeners
          mongoose.connection.once('connected', onConnected);
          mongoose.connection.once('error', onError);
        });
        
        await connectionPromise;
        return true;
      } catch (error) {
        console.error('Connection wait failed:', error);
        // Reset flags
        isConnecting = false;
        // Try to initialize fresh connection
        await initDatabase();
        return true;
      }
      
    case 3: // Disconnecting
      // Brief wait then attempt reconnection
      await new Promise(resolve => setTimeout(resolve, 300));
      await initDatabase();
      return true;
      
    default: // Not connected (0) or invalid state
      await initDatabase();
      return true;
  }
}