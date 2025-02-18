import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Novel from '@/models/Novel';

export async function GET() {
  try {
    await connectDB();
    const novels = await Novel.find({}).sort({ createdAt: -1 });
    return NextResponse.json(novels);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to fetch novels:', error.message);
    }
    return NextResponse.json(
      { error: 'Failed to fetch novels' },
      { status: 500 }
    );
  }
} 