import { NextResponse } from 'next/server';
import Novel from '@/models/Novel';
import process from 'process';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract novel data
    const { title, author, description, genres, status = 'ongoing', coverImage, contentUrl } = body;

    // Debug log
    console.log('Received data:', { title, author, contentUrl });

    // Validate required fields
    if (!title || !author || !description || !genres || !coverImage || !contentUrl) {
      console.log('Missing fields:', { 
        hasTitle: !!title, 
        hasAuthor: !!author, 
        hasDescription: !!description, 
        hasGenres: !!genres, 
        hasCoverImage: !!coverImage, 
        hasContentUrl: !!contentUrl 
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
        coverImage,
        contentUrl,
      });

      // Create the novel in database
      const novel = await Novel.create({
        title,
        author,
        description,
        genres,
        status,
        coverImage,
        contentUrl,
        rating: 0,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Debug log after creation
      console.log('Created novel:', {
        id: novel._id,
        title: novel.title,
        contentUrl: novel.contentUrl,
      });

      // Process the content into chapters
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const processResponse = await fetch(`${baseUrl}/api/v1/novels/${novel._id}/process-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentUrl }),
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json().catch(() => null);
        const errorMessage = errorData?.error || processResponse.statusText;
        
        if (processResponse.status === 504) {
          return NextResponse.json(
            { 
              message: 'Truyện đã được tải lên, nhưng xử lý nội dung bị timeout. Vui lòng thử lại sau.',
              novel,
              error: errorMessage
            },
            { status: 202 }  // Accepted but processing incomplete
          );
        }

        console.error('Failed to process content:', {
          status: processResponse.status,
          statusText: processResponse.statusText,
          error: errorMessage
        });

        return NextResponse.json(
          { 
            message: 'Truyện đã được tải lên, nhưng xử lý nội dung thất bại.',
            novel,
            error: errorMessage
          },
          { status: 202 }
        );
      }

      const processResult = await processResponse.json();

      return NextResponse.json(
        {
          message: 'Đăng tải và xử lý truyện thành công',
          novel,
          processResult
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Không thể lưu thông tin truyện. Vui lòng thử lại.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: true
  }
}; 