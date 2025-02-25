import { NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Không tìm thấy file' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'text/plain') {
      return NextResponse.json(
        { error: 'Chỉ chấp nhận file .txt' },
        { status: 400 }
      );
    }

    // Validate file size (1MB)
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Kích thước file phải nhỏ hơn 1MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const timestamp = Date.now();
    const uniqueFilename = `chapters/${timestamp}-${file.name}`;

    // Upload to S3 using our optimized utility function
    const contentUrl = await uploadToS3(
      uniqueFilename,
      buffer,
      'text/plain'
    );

    return NextResponse.json({
      message: 'Upload thành công',
      contentUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Không thể tải lên file. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
} 