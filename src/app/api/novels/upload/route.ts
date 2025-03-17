import { NextResponse } from 'next/server';
import { NovelModel, UserModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { NovelStatus } from '@/types/novel';

// Set the maximum duration for this API route (60 seconds)
export const maxDuration = 60;

export const POST = createApiHandler(async (request: Request) => {
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
    let body: {
      title: string;
      author: string;
      description: string;
      genres: string[];
      status?: NovelStatus;
      coverImage: string;
    };
    
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
      // Verify the user exists in the database
      const userId = parseInt(session.user.id);
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Người dùng không tồn tại trong hệ thống' },
          { status: 404 }
        );
      }
      
      // Create the novel in database
      const novel = await NovelModel.create({
        title,
        author,
        description,
        genres,
        status: status as NovelStatus,
        coverImage,
        uploadedBy: userId
      });

      // Debug log after creation
      console.log('Created novel:', {
        id: novel.id,
        title: novel.title,
        slug: novel.slug,
        uploadedBy: novel.uploadedBy
      });

      // Return the created novel
      return NextResponse.json(novel, { status: 201 });
    } catch (error: unknown) {
      console.error('Error creating novel:', error);
      
      // More detailed error handling
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          return NextResponse.json(
            { error: 'Quá thời gian xử lý. Vui lòng thử lại sau.' },
            { status: 504 }
          );
        }
        
        if (error.message.includes('validation')) {
          return NextResponse.json(
            { error: 'Dữ liệu không hợp lệ', details: error.message },
            { status: 400 }
          );
        }
      }
      
      // Generic error with safe details
      return NextResponse.json(
        { error: 'Không thể tạo truyện mới', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error in novel upload:', error);
    // Ensure we return valid JSON even for unexpected errors
    return NextResponse.json(
      { error: 'Không thể đăng tải truyện. Vui lòng thử lại.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

export const config = {
  api: {
    bodyParser: true,
    // Increase timeout settings
    externalResolver: true,
  }
}; 