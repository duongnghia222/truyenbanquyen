import { NextResponse } from 'next/server';
import Chapter from '@/models/Chapter';

type RouteParams = {
  params: Promise<{ id: string; chapterNumber: string }>
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id, chapterNumber } = await params;
    
    // Check if chapter exists
    const chapter = await Chapter.findOne({
      novelId: id,
      chapterNumber: parseInt(chapterNumber)
    }).select('_id');
    
    if (!chapter) {
      return NextResponse.json(
        { exists: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ exists: true });
  } catch (error) {
    console.error('Error checking chapter existence:', error);
    return NextResponse.json(
      { error: 'Failed to check chapter' },
      { status: 500 }
    );
  }
} 