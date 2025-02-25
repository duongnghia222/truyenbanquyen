import { NextResponse } from 'next/server';
import Novel from '@/models/Novel';
import { FilterQuery } from 'mongoose';
import { initDatabase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Ensure database connection is established
    await initDatabase();
    
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
    const [novels, total] = await Promise.all([
      Novel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Novel.countDocuments(query)
    ]);

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
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to fetch novels:', error.message);
    }
    return NextResponse.json(
      { error: 'Failed to fetch novels' },
      { status: 500 }
    );
  }
}

// Add POST method to create a new novel
export async function POST(request: Request) {
  try {
    // Ensure database connection is established
    await initDatabase();
    
    const body = await request.json();
    
    // Create new novel
    const novel = await Novel.create({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json(novel, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to create novel:', error.message);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { error: 'Validation failed', details: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create novel' },
      { status: 500 }
    );
  }
} 