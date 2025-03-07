import { NextRequest, NextResponse } from 'next/server';
import Novel from '@/models/Novel';
import User from '@/models/User';
import { FilterQuery } from 'mongoose';
import { createApiHandler } from '@/lib/api-utils';

// Using our optimized handler wrapper
export const GET = createApiHandler(async (request: NextRequest) => {
  // Get URL parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sort = searchParams.get('sort') || '-createdAt'; // Default sort by newest
  const status = searchParams.get('status');
  const genre = searchParams.get('genre');
  const search = searchParams.get('search');
  
  // Build query
  const query: FilterQuery<typeof Novel> = {};
  
  // Add filters
  if (status) {
    query.status = status;
  }
  if (genre) {
    query.genres = genre;
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Execute query with pagination
  const [novelsData, total] = await Promise.all([
    Novel.find(query)
      .populate({
        path: 'uploadedBy',
        select: 'username',
        model: User
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Novel.countDocuments(query)
  ]);

  // Add uploaderUsername to each novel
  const novels = novelsData.map(novel => {
    const formattedNovel = { ...novel };
    if (novel.uploadedBy && novel.uploadedBy.username) {
      formattedNovel.uploaderUsername = novel.uploadedBy.username;
    }
    return formattedNovel;
  });

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return NextResponse.json({
    novels,
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
  const novel = await Novel.create({
    ...body,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return NextResponse.json(novel, { status: 201 });
}); 