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

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Don't buffer commands when no connection is available
      // Connection pool configuration
      maxPoolSize: 5, // Reduced from 10 for serverless environment
      minPoolSize: 1, // Reduced from 5 for serverless environment 
      connectTimeoutMS: 30000, // Increased connection timeout (30 seconds)
      socketTimeoutMS: 45000, // Socket timeout in ms (45 seconds)
      // Performance improvements
      autoIndex: process.env.NODE_ENV !== 'production', // Don't build indexes in production
      serverSelectionTimeoutMS: 30000, // Increased server selection timeout
      heartbeatFrequencyMS: 10000, // Heartbeat frequency
      // Additional options for stability
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      // Add these options for better error handling
      waitQueueTimeoutMS: 30000, // How long to wait for a connection from the pool
      maxIdleTimeMS: 60000, // How long a connection can remain idle before being removed
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    };

    // Include retry logic for the initial connection
    let retries = 3;
    while (retries > 0) {
      try {
        cached.promise = mongoose.connect(MONGODB_URI, opts);
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
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB; 