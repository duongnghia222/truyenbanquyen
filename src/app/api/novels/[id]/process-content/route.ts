import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Novel from '@/models/Novel';
import Chapter from '@/models/Chapter';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { contentUrl } = await request.json();
    if (!contentUrl) {
      return NextResponse.json(
        { error: 'Missing content URL' },
        { status: 400 }
      );
    }

    // Fetch the content from S3
    const response = await fetch(contentUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Could not fetch content' },
        { status: 500 }
      );
    }

    const content = await response.text();

    // Split content into chapters
    const chapterRegex = /^Chương\s+(\d+)(?:[\s:]+(.+?))?(?:\n|\r\n)([\s\S]*?)(?=(?:\n|\r\n)Chương\s+\d+|$)/gm;
    const chapters = [];
    let match;

    while ((match = chapterRegex.exec(content)) !== null) {
      const [, number, title = `Chương ${number}`, chapterContent] = match;
      chapters.push({
        chapterNumber: parseInt(number),
        title: title.trim(),
        content: chapterContent.trim(),
      });
    }

    if (chapters.length === 0) {
      // If no chapters found, create a single chapter
      chapters.push({
        chapterNumber: 1,
        title: 'Chương 1',
        content: content.trim(),
      });
    }

    // Save chapters to database
    const savedChapters = await Promise.all(
      chapters.map(chapter =>
        Chapter.create({
          novelId: params.id,
          ...chapter,
        })
      )
    );

    // Update novel with chapter count
    await Novel.findByIdAndUpdate(params.id, {
      $set: {
        chapterCount: chapters.length,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Processed content successfully',
      chapters: savedChapters,
    });

  } catch (error) {
    console.error('Process content error:', error);
    return NextResponse.json(
      { error: 'Could not process content' },
      { status: 500 }
    );
  }
} 