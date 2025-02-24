import { NextResponse } from 'next/server';
import Chapter from '@/models/Chapter';
import Novel from '@/models/Novel';

type RouteParams = {
  params: Promise<{ id: string }>
};

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { title, contentUrl, chapterNumber } = await request.json();

    // Validate required fields
    if (!title || !contentUrl || !chapterNumber) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Check if novel exists
    const novel = await Novel.findById(id);
    if (!novel) {
      return NextResponse.json(
        { error: 'Không tìm thấy truyện' },
        { status: 404 }
      );
    }

    // Check if chapter number already exists
    const existingChapter = await Chapter.findOne({
      novelId: id,
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
      novelId: id,
      title,
      contentUrl,
      chapterNumber,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update novel's chapter count
    await Novel.findByIdAndUpdate(id, {
      $inc: { chapterCount: 1 },
      updatedAt: new Date()
    });

    return NextResponse.json(
      { message: 'Đăng tải chương thành công', chapter },
      { status: 201 }
    );

  } catch (error) {
    console.error('Failed to upload chapter:', error);
    return NextResponse.json(
      { error: 'Không thể tải lên chương. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
} 