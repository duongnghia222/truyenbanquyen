import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Novel from '@/models/Novel';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    const novels = await Novel.find({}).sort({ createdAt: -1 });
    return NextResponse.json(novels);
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

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'author', 'description', 'coverImage', 'genres'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          missingFields 
        },
        { status: 400 }
      );
    }

    // Validate genres array
    if (!Array.isArray(data.genres) || data.genres.length === 0) {
      return NextResponse.json(
        { error: 'At least one genre is required' },
        { status: 400 }
      );
    }

    // Create the novel
    const novel = await Novel.create({
      ...data,
      status: data.status || 'ongoing',
      rating: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { 
        message: 'Novel created successfully', 
        novel 
      }, 
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to create novel:', error.message);
    }
    
    // Handle duplicate title error (MongoDB specific error)
    if (error instanceof mongoose.Error.MongooseError) {
      const mongoError = error as any;
      if (mongoError.code === 11000) {
        return NextResponse.json(
          { error: 'A novel with this title already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create novel' },
      { status: 500 }
    );
  }
} 