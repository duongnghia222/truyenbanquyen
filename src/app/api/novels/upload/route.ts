import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Novel from '@/models/Novel';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

    const formData = await request.formData();
    
    // Extract novel data
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const description = formData.get('description') as string;
    const genres = JSON.parse(formData.get('genres') as string);
    const status = formData.get('status') as string || 'ongoing';
    
    // Get the cover image file
    const coverImage = formData.get('coverImage') as File;

    // Validate required fields
    if (!title || !author || !description || !genres || !coverImage) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Validate file size
    if (coverImage.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Kích thước ảnh phải nhỏ hơn 5MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(coverImage.type)) {
      return NextResponse.json(
        { error: 'Ảnh bìa phải là định dạng JPEG, PNG hoặc WebP' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const extension = coverImage.type.split('/')[1];
    const filename = `${timestamp}-${title.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
    
    try {
      // Save the file
      const bytes = await coverImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Ensure the directory exists
      const uploadDir = join(process.cwd(), 'public', 'images', 'novels');
      
      // Save to public/images/novels directory
      const path = join(uploadDir, filename);
      await writeFile(path, buffer);
    } catch (error) {
      console.error('File upload error:', error);
      return NextResponse.json(
        { error: 'Không thể tải lên ảnh bìa. Vui lòng thử lại.' },
        { status: 500 }
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
        coverImage: `/images/novels/${filename}`,
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

// Handle large files
export const config = {
  api: {
    bodyParser: false,
  },
}; 