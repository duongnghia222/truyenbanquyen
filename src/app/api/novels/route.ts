import { NextRequest, NextResponse } from 'next/server';
import { NovelModel, UserModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';

// Using our optimized handler wrapper
export const GET = createApiHandler(async (request: NextRequest) => {
  // Get URL parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sort = searchParams.get('sort') || 'createdAt'; // Default sort field
  const order = searchParams.get('order') || 'DESC'; // Default order
  const status = searchParams.get('status');
  const genre = searchParams.get('genre');
  const search = searchParams.get('search');
  
  let result;
  
  // Handle different query scenarios
  if (search) {
    result = await NovelModel.search(search, page, limit);
  } else if (genre) {
    result = await NovelModel.findByGenre(genre, page, limit);
  } else {
    // Build query options for findAll
    const options = {
      status: status || undefined,
      sortBy: sort,
      order: order as 'ASC' | 'DESC'
    };
    
    result = await NovelModel.findAll(page, limit, options.sortBy, options.order);
  }
  
  const { novels, total } = result;
  
  // Fetch uploader usernames
  const userIds = novels.map(novel => novel.uploadedBy);
  const users = await UserModel.findByIds(userIds);
  
  // Add uploaderUsername to each novel
  const novelsWithUsername = novels.map(novel => {
    const user = users.find(u => u.id === novel.uploadedBy);
    return {
      ...novel,
      uploaderUsername: user ? user.username : null
    };
  });

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return NextResponse.json({
    novels: novelsWithUsername,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      hasNextPage,
      hasPrevPage,
      limit
    }
  });
});

// Add POST method to create a new novel
export const POST = createApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  
  // Create new novel
  const novel = await NovelModel.create({
    title: body.title,
    author: body.author,
    description: body.description,
    coverImage: body.coverImage,
    genres: body.genres,
    status: body.status,
    uploadedBy: body.uploadedBy
  });

  return NextResponse.json(novel, { status: 201 });
}); 