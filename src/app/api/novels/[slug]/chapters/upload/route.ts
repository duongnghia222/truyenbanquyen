import { NextResponse } from 'next/server';
import { ChapterModel } from '@/models/postgresql';
import { NovelModel } from '@/models/postgresql';

type RouteParams = {
  params: Promise<{ slug: string }>
};

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { title, contentUrl, chapterNumber } = await request.json();

    // Validate required fields
    if (!title || !contentUrl || !chapterNumber) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Find novel by slug
    const novel = await NovelModel.findBySlug(slug);
    if (!novel) {
      return NextResponse.json(
        { error: 'Không tìm thấy truyện' },
        { status: 404 }
      );
    }

    // Check if chapter number already exists
    const existingChapter = await ChapterModel.findByNovelIdAndChapterNumber(
      novel.id,
      parseInt(chapterNumber)
    );

    if (existingChapter) {
      return NextResponse.json(
        { error: 'Số chương đã tồn tại' },
        { status: 400 }
      );
    }

    // Create the chapter
    const chapter = await ChapterModel.create({
      novelId: novel.id,
      title,
      contentUrl,
      chapterNumber: parseInt(chapterNumber)
    });

    // Update novel's chapter count
    await NovelModel.update(novel.id, { chapterCount: (novel.chapterCount || 0) + 1 });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error('Failed to create chapter:', error);
    return NextResponse.json(
      { error: 'Không thể tạo chương mới' },
      { status: 500 }
    );
  }
} 