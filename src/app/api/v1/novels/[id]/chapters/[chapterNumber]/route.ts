import { NextResponse } from 'next/server';
import Chapter from '@/models/Chapter';

type RouteParams = {
  params: Promise<{ id: string; chapterNumber: string }>
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id, chapterNumber } = await params;
    console.log(id, chapterNumber);
    const chapter = await Chapter.findOne({
      novelId: id,
      chapterNumber: parseInt(chapterNumber)
    });
    console.log(chapter);
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Increment views
    await Chapter.findByIdAndUpdate(chapter._id, { $inc: { views: 1 } });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Failed to fetch chapter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
} 