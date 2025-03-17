import { NextResponse } from 'next/server';
import { ChapterModel, NovelModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';

type RouteParams = {
  params: { slug: string }
};

export const GET = createApiHandler(async (request: Request, { params }: RouteParams) => {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // First, find the novel by slug to get its ID
    const novel = await NovelModel.findBySlug(slug);
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      );
    }

    // Fetch chapters for the novel with pagination
    const result = await ChapterModel.findByNovelId(novel.id, page, limit);
    const { chapters, total } = result;

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      chapters,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });
  } catch (error) {
    console.error('Failed to fetch chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
});

// POST method
export const POST = createApiHandler(async (request: Request, { params }: RouteParams) => {
  try {
    const { slug } = params;
    
    // First, find the novel by slug to get its ID
    const novel = await NovelModel.findBySlug(slug);
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    
    // Create a new chapter
    const chapter = await ChapterModel.create({
      ...data,
      novelId: novel.id
    });
    
    // Update the novel's chapter count
    await NovelModel.updateChapterCount(novel.id);
    
    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error('Failed to create chapter:', error);
    return NextResponse.json(
      { error: 'Failed to create chapter' },
      { status: 500 }
    );
  }
}); 