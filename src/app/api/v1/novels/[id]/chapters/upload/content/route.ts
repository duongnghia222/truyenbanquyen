import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: uniqueFilename,
      Body: buffer,
      ContentType: 'text/plain',
    });

    await s3Client.send(command);

    // Generate the URL
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;

    return NextResponse.json({
      message: 'Upload thành công',
      contentUrl: fileUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Không thể tải lên file. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
} 