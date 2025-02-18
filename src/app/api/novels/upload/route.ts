import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Novel from '@/models/Novel';

export async function POST(request: Request) {
  try {
    // Try to connect to MongoDB first
    try {
      await connectDB();
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return NextResponse.json(
        { 
          error: 'Không thể kết nối đến cơ sở dữ liệu. Vui lòng thử lại sau hoặc liên hệ admin.' 
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Extract novel data
    const { title, author, description, genres, status = 'ongoing', coverImage, contentUrl } = body;

    // Validate required fields
    if (!title || !author || !description || !genres || !coverImage || !contentUrl) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    try {
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

      return NextResponse.json(
        {
          message: 'Đăng tải truyện thành công',
          novel
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

// Remove the bodyParser config since we're handling JSON
export const config = {
  api: {
    bodyParser: true
  }
}; 