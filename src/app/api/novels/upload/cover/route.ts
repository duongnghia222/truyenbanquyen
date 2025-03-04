import { NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3';

// Set the maximum duration for this API route (60 seconds)
export const maxDuration = 60;

// Helper function to handle timeouts
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
    
    promise
      .then((result) => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
};

export async function POST(request: Request) {
  try {
    // Parse formData with timeout
    const formDataPromise = request.formData();
    const formData = await withTimeout(
      formDataPromise, 
      15000, 
      'Lỗi thời gian chờ khi xử lý dữ liệu'
    );
    
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

    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate a unique filename
      const timestamp = Date.now();
      const uniqueFilename = `covers/${timestamp}-${file.name}`;

      // Upload to S3 using our optimized utility function with timeout
      console.log('Starting S3 upload...');
      
      const fileUrlPromise = uploadToS3(
        uniqueFilename,
        buffer,
        file.type
      );
      
      // Add a timeout of 30 seconds for the S3 upload
      const fileUrl = await withTimeout(
        fileUrlPromise,
        30000,
        'Tải lên S3 mất quá nhiều thời gian'
      );
      
      console.log('S3 upload complete:', fileUrl);

      return NextResponse.json({
        message: 'Upload thành công',
        fileUrl
      });
    } catch (uploadError) {
      console.error('S3 upload error:', uploadError);
      
      // Specific error for timeout
      if (uploadError instanceof Error && uploadError.message === 'Tải lên S3 mất quá nhiều thời gian') {
        return NextResponse.json(
          { error: 'Quá thời gian tải lên. Vui lòng thử lại.' },
          { status: 504 }
        );
      }
      
      // Detailed error response
      return NextResponse.json(
        { 
          error: 'Lỗi khi tải lên ảnh bìa', 
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    
    // Specific handling for timeout errors
    if (error instanceof Error && error.message === 'Lỗi thời gian chờ khi xử lý dữ liệu') {
      return NextResponse.json(
        { error: 'Quá thời gian xử lý. Vui lòng thử lại.' },
        { status: 504 }
      );
    }
    
    // Ensure we return valid JSON even for unexpected errors
    return NextResponse.json(
      { 
        error: 'Không thể tải lên file. Vui lòng thử lại sau.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
    // Use external resolver for longer timeout
    externalResolver: true,
  },
}; 