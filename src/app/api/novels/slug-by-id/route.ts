import { NextResponse } from 'next/server';
import { NovelModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';

export const GET = createApiHandler(async (request: Request) => {
  // Get the novel ID from the query parameters
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Novel ID is required' },
      { status: 400 }
    );
  }

  // Validate ID format
  const novelId = parseInt(id);
  if (isNaN(novelId)) {
    return NextResponse.json(
      { error: 'Invalid novel ID format' },
      { status: 400 }
    );
  }

  try {
    // Find the novel by ID
    const novel = await NovelModel.findById(novelId);

    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      );
    }

    // Return just the slug
    return NextResponse.json({
      slug: novel.slug
    });
  } catch (error) {
    console.error('Error fetching novel slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch novel slug' },
      { status: 500 }
    );
  }
}); 