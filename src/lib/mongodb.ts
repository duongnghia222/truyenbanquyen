import mongoose from 'mongoose';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Define connection options outside the function to make them available for reconnection
const connectionOptions = {
  bufferCommands: false, // Don't buffer commands when no connection is available
  // Connection pool configuration for EC2 (non-serverless)
  maxPoolSize: 20, // Increased for EC2 environment
  minPoolSize: 5, // Increased for EC2 environment
  connectTimeoutMS: 20000, // Connection timeout (20 seconds)
  socketTimeoutMS: 45000, // Socket timeout in ms (45 seconds)
  // Performance improvements
  autoIndex: process.env.NODE_ENV !== 'production', // Don't build indexes in production
  serverSelectionTimeoutMS: 15000, // Server selection timeout
  heartbeatFrequencyMS: 10000, // Heartbeat frequency
  // Additional options for stability
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  // Reduce wait time for connections in a persistent environment
  waitQueueTimeoutMS: 10000, // How long to wait for a connection from the pool
  maxIdleTimeMS: 30000, // How long a connection can remain idle before being removed
  serverApi: {
    version: '1' as const,
    strict: true,
    deprecationErrors: true,
  }
};

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Include retry logic for the initial connection
    let retries = 3;
    while (retries > 0) {
      try {
        cached.promise = mongoose.connect(MONGODB_URI, connectionOptions);
        break;
      } catch (err) {
        retries--;
        console.error(`MongoDB connection error. Retries left: ${retries}`, err);
        if (retries === 0) throw err;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  try {
    cached.conn = await cached.promise;
    
    // Set up event listeners for connection stability
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
      // Only attempt reconnection if not already in progress
      if (!cached.promise) {
        console.log('Reconnection attempt initiated');
        cached.promise = mongoose.connect(MONGODB_URI, connectionOptions);
      }
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      // Clear promise on connection error to allow fresh reconnection attempts
      if (cached.promise) {
        cached.promise = null;
      }
    });
    
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', e);
    throw e;
  }

  if (!cached.conn) {
    throw new Error('Failed to establish MongoDB connection');
  }

  return cached.conn;
}

export default connectDB; 