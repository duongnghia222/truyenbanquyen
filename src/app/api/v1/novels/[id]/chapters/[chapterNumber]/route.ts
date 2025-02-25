import { NextResponse } from 'next/server';
import Chapter from '@/models/Chapter';
import Novel from '@/models/Novel';
import mongoose from 'mongoose';
import { initDatabase } from '@/lib/db';

type RouteParams = {
  params: Promise<{ id: string; chapterNumber: string }>
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Ensure database connection is established
    await initDatabase();
    
    const { id, chapterNumber } = await params;
    
    // Validate novel ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid novel ID format' },
        { status: 400 }
      );
    }
    
    // Make sure chapterNumber is a valid number
    const chapterNum = parseInt(chapterNumber);
    if (isNaN(chapterNum)) {
      return NextResponse.json(
        { error: 'Invalid chapter number' },
        { status: 400 }
      );
    }
    
    // Check if the novel exists
    const novel = await Novel.findById(id).select('_id chapterCount');
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
      novelId: id,
      chapterNumber: chapterNum
    });
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Increment views asynchronously (don't wait for completion)
    Chapter.findByIdAndUpdate(chapter._id, { $inc: { views: 1 } }).exec()
      .catch(err => console.error('Failed to increment chapter views:', err));

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Failed to fetch chapter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
} 