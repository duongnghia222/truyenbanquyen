import { NextResponse } from 'next/server';
import Novel from '@/models/Novel';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
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
      // Debug log before creation
      console.log('Creating novel with data:', {
        title,
        author,
        description: description.substring(0, 50) + '...',
        genres,
        status,
        coverImage
      });

      // Create the novel in database
      const novel = await Novel.create({
        title,
        author,
        description,
        genres,
        status,
        coverImage,
        rating: 0,
        views: 0,
        chapterCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Debug log after creation
      console.log('Created novel:', {
        id: novel._id,
        title: novel.title
      });

      // Return the created novel
      return NextResponse.json(novel, { status: 201 });
    } catch (error: unknown) {
      console.error('Error creating novel:', error);
      
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
      throw error;
    }
  } catch (error) {
    console.error('Error in novel upload:', error);
    return NextResponse.json(
      { error: 'Không thể đăng tải truyện. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: true
  }
}; 