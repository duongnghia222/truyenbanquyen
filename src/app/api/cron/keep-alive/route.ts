import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

export const maxDuration = 10;

// This is a simple endpoint that will be called by Vercel Cron to keep the database connection alive
export async function GET() {
  try {
    // Initialize the database connection
    await initDatabase();
    
    console.log('Keep-alive endpoint triggered successfully');
    
    return NextResponse.json(
      { status: 'ok', message: 'Database connection verified', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error('Keep-alive endpoint error:', error);
    
    return NextResponse.json(
      { status: 'error', message: 'Failed to verify database connection' },
      { status: 500 }
    );
  }
} 