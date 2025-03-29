import { NextResponse } from 'next/server';
import { ChapterModel, NovelModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';

type RouteParams = {
  params: { slug: string; chapterNumber: string }
};

export const GET = createApiHandler(async (request: Request, { params }: RouteParams) => {
  try {
    const { slug, chapterNumber } = params;
    
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
    
    // NOTE: View count is no longer incremented here
    // It will be handled by the POST endpoint after 3 minutes of reading
    
    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Failed to fetch chapter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
});

export const POST = createApiHandler(async (request: Request, { params }: RouteParams) => {
  try {
    const { slug, chapterNumber } = params;
    
    // Validate request body to ensure it contains required data
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Verify the reading duration is at least 3 minutes (180000 milliseconds)
    const { readingDuration } = requestData;
    if (!readingDuration || typeof readingDuration !== 'number' || readingDuration < 180000) {
      return NextResponse.json(
        { error: 'Insufficient reading time for view count' },
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
    
    // Increment view count after verifying 3+ minutes of reading time
    await ChapterModel.incrementViews(chapter.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'View counted successfully' 
    });
  } catch (error) {
    console.error('Failed to register chapter view:', error);
    return NextResponse.json(
      { error: 'Failed to register view' },
      { status: 500 }
    );
  }
}); 