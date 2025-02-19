import mongoose from 'mongoose';
import connectDB from './mongodb';

let hasShownConnectionMessage = false;

export async function initDatabase() {
  try {
    await connectDB();
    if (!hasShownConnectionMessage) {
      console.log('✅ MongoDB connected successfully');
      hasShownConnectionMessage = true;
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});