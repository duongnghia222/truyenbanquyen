import { NextResponse } from 'next/server';
import Chapter from '@/models/Chapter';
import Novel from '@/models/Novel';
import { ensureDatabaseConnection } from '@/lib/db';

type RouteParams = {
  params: Promise<{ slug: string }>
};

export async function POST(request: Request, { params }: RouteParams) {
  try {
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    const { slug } = await params;
    const { title, contentUrl, chapterNumber, summary } = await request.json();

    // Validate required fields
    if (!title || !contentUrl || !chapterNumber) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Find novel by slug
    const novel = await Novel.findOne({ slug });
    if (!novel) {
      return NextResponse.json(
        { error: 'Không tìm thấy truyện' },
        { status: 404 }
      );
    }

    // Check if chapter number already exists
    const existingChapter = await Chapter.findOne({
      novelId: novel._id,
      chapterNumber: chapterNumber
    });

    if (existingChapter) {
      return NextResponse.json(
        { error: 'Số chương đã tồn tại' },
        { status: 400 }
      );
    }

    // Create the chapter
    const chapter = await Chapter.create({
      novelId: novel._id,
      title,
      contentUrl,
      chapterNumber,
      summary: summary || null,
      views: 0,
    });

    // Update novel's chapter count
    await Novel.findByIdAndUpdate(
      novel._id,
      { 
        $inc: { chapterCount: 1 },
        updatedAt: new Date()
      }
    );

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error('Failed to create chapter:', error);
    return NextResponse.json(
      { error: 'Không thể tạo chương mới' },
      { status: 500 }
    );
  }
} 