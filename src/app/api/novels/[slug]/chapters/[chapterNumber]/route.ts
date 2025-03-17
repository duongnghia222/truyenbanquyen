import { NextResponse } from 'next/server';
import Chapter from '@/models/Chapter';
import Novel from '@/models/Novel';
import { initDatabase } from '@/lib/db';

type RouteParams = {
  params: Promise<{ slug: string; chapterNumber: string }>
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Ensure database connection is established
    await initDatabase();
    
    const { slug, chapterNumber } = await params;
    
    // Make sure chapterNumber is a valid number
    const chapterNum = parseInt(chapterNumber);
    if (isNaN(chapterNum)) {
      return NextResponse.json(
        { error: 'Invalid chapter number' },
        { status: 400 }
      );
    }
    
    // Find the novel by slug
    const novel = await Novel.findOne({ slug }).select('_id chapterCount');
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      );
    }
    
    // Check if chapter number is within valid range
    if (chapterNum <= 0 || chapterNum > novel.chapterCount) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    // Find the chapter
    const chapter = await Chapter.findOne({
      novelId: novel._id,
      chapterNumber: chapterNum
    });
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await Chapter.findByIdAndUpdate(
      chapter._id,
      { $inc: { views: 1 } }
    );
    
    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Failed to fetch chapter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
} 