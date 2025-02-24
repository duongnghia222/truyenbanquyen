import { NextResponse } from 'next/server';
import Chapter from '@/models/Chapter';

type RouteParams = {
  params: Promise<{ id: string }>
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Fetch chapters for the novel with pagination
    const [chapters, total] = await Promise.all([
      Chapter.find({ novelId: id })
        .sort({ chapterNumber: 1 })
        .skip(skip)
        .limit(limit)
        .select('title chapterNumber views createdAt')
        .lean(),
      Chapter.countDocuments({ novelId: id })
    ]);

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
} 