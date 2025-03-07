import { NextResponse } from 'next/server';
import Novel from '@/models/Novel';
import User from '@/models/User';
import { ensureDatabaseConnection } from '@/lib/db';
import { Types } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// Set the maximum duration for this API route (60 seconds)
export const maxDuration = 60;

// Define the Novel document type for proper typing
interface NovelDocument {
  _id: Types.ObjectId | string;
  title: string;
  author: string;
  description: string;
  genres: string[];
  status: string;
  coverImage: string;
  uploadedBy: Types.ObjectId | string;
  rating: number;
  views: number;
  chapterCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(request: Request) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để đăng tải truyện' },
        { status: 401 }
      );
    }
    
    // Parse JSON with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON format in request body' },
        { status: 400 }
      );
    }
    
    // Extract novel data
    const { title, author, description, genres, status = 'ongoing', coverImage } = body;

    // Debug log
    console.log('Received data:', { title, author });

    // Validate required fields
    if (!title || !author || !description || !genres || !coverImage) {
      console.log('Missing fields:', { 
        hasTitle: !!title, 
        hasAuthor: !!author, 
        hasDescription: !!description, 
        hasGenres: !!genres, 
        hasCoverImage: !!coverImage
      });
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    try {
      // Ensure database connection is established before proceeding
      await ensureDatabaseConnection();
      
      // Debug log before creation
      console.log('Creating novel with data:', {
        title,
        author,
        description: description.substring(0, 50) + '...',
        genres,
        status,
        coverImage
      });

      // Create the novel in database with timeout
      const novelData = {
        title,
        author,
        description,
        genres,
        status,
        coverImage,
        uploadedBy: session.user.id,
        rating: 0,
        views: 0,
        chapterCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Set a reasonable timeout for the database operation (30 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timed out')), 30000)
      );
      
      const dbPromise = Novel.create(novelData);
      // Add proper type annotation to avoid 'unknown' type
      const novel = await Promise.race([dbPromise, timeoutPromise]) as NovelDocument;

      // Add novel to user's uploadedNovels array
      await User.findByIdAndUpdate(
        session.user.id,
        { $push: { uploadedNovels: novel._id } }
      );

      // Debug log after creation
      console.log('Created novel:', {
        id: novel._id,
        title: novel.title,
        uploadedBy: novel.uploadedBy
      });

      // Return the created novel
      return NextResponse.json(novel, { status: 201 });
    } catch (error: unknown) {
      console.error('Error creating novel:', error);
      
      // More detailed error handling
      if (error instanceof Error && error.message === 'Database operation timed out') {
        return NextResponse.json(
          { error: 'Quá thời gian xử lý. Vui lòng thử lại sau.' },
          { status: 504 }
        );
      }
      
      // Check if error is a ValidationError-like object
      if (
        error && 
        typeof error === 'object' && 
        'name' in error && 
        error.name === 'ValidationError' &&
        'message' in error &&
        typeof error.message === 'string'
      ) {
        return NextResponse.json(
          { error: 'Dữ liệu không hợp lệ', details: error.message },
          { status: 400 }
        );
      }
      
      // Generic error with safe details
      return NextResponse.json(
        { error: 'Không thể tạo truyện mới', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in novel upload:', error);
    // Ensure we return valid JSON even for unexpected errors
    return NextResponse.json(
      { error: 'Không thể đăng tải truyện. Vui lòng thử lại.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: true,
    // Increase timeout settings
    externalResolver: true,
  }
}; 