import { NextResponse } from 'next/server';
import { ChapterModel, NovelModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';

type RouteParams = {
  params: Promise<{ slug: string; chapterNumber: string }>
};

export const GET = createApiHandler(async (request: Request, { params }: RouteParams) => {
  try {
    const paramsData = await params;
    const { slug, chapterNumber } = paramsData;
    
    // Make sure chapterNumber is a valid number
    const chapterNum = parseInt(chapterNumber);
    if (isNaN(chapterNum)) {
      return NextResponse.json(
        { error: 'Invalid chapter number' },
        { status: 400 }
      );
    }
    
    // Find the novel by slug
    const novel = await NovelModel.findBySlug(slug);
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
    const chapter = await ChapterModel.findByNovelIdAndChapterNumber(novel.id, chapterNum);
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await ChapterModel.incrementViews(chapter.id);
    
    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Failed to fetch chapter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
}); 