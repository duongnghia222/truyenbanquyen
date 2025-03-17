import { NextResponse } from 'next/server';
import { ChapterModel } from '@/models/postgresql';

type RouteParams = {
  params: Promise<{ id: string; chapterNumber: string }>
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id, chapterNumber } = await params;
    
    // Check if chapter exists
    const chapter = await ChapterModel.findByNovelIdAndChapterNumber(
      Number(id),
      parseInt(chapterNumber)
    );
    
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