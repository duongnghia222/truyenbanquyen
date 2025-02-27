import { NextResponse } from 'next/server';
import Chapter from '@/models/Chapter';
import Novel from '@/models/Novel';
import { ensureDatabaseConnection } from '@/lib/db';

type RouteParams = {
  params: Promise<{ id: string }>
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
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

// If there's a POST method
export async function POST(request: Request, { params }: RouteParams) {
  try {
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    const { id } = await params;
    const body = await request.json();
    
    // Simple implementation - adjust according to your actual needs
    const chapter = await Chapter.create({
      ...body,
      novelId: id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Update the novel's chapter count
    await Novel.findByIdAndUpdate(id, { $inc: { chapterCount: 1 } });
    
    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error('Failed to create chapter:', error);
    return NextResponse.json(
      { error: 'Failed to create chapter' },
      { status: 500 }
    );
  }
} 