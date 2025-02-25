import { NextResponse } from 'next/server';
import { getS3Client, uploadToS3 } from '@/lib/s3';

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
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Chỉ chấp nhận file ảnh' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Kích thước file phải nhỏ hơn 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const timestamp = Date.now();
    const uniqueFilename = `covers/${timestamp}-${file.name}`;

    // Upload to S3 using our optimized utility function
    const fileUrl = await uploadToS3(
      uniqueFilename,
      buffer,
      file.type
    );

    return NextResponse.json({
      message: 'Upload thành công',
      fileUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Không thể tải lên file. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 