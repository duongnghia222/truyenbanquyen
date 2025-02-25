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
      bufferCommands: true,
      // Connection pool configuration
      maxPoolSize: 10, // Maximum number of connections in pool
      minPoolSize: 5,  // Minimum number of connections in pool
      connectTimeoutMS: 10000, // Connection timeout in ms (10 seconds)
      socketTimeoutMS: 45000, // Socket timeout in ms (45 seconds)
      // Performance improvements
      autoIndex: process.env.NODE_ENV !== 'production', // Don't build indexes in production
      serverSelectionTimeoutMS: 5000, // Server selection timeout
      heartbeatFrequencyMS: 10000, // Heartbeat frequency
      // Additional options for stability
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
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