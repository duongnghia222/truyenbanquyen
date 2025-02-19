import { NextResponse } from 'next/server';
import Novel from '@/models/Novel';
import Chapter from '@/models/Chapter';

type RouteParams = {
  params: Promise<{ id: string }>
};

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { contentUrl } = await request.json();

    if (!contentUrl) {
      return NextResponse.json(
        { error: 'Content URL is required' },
        { status: 400 }
      );
    }

    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      // Fetch the content
      const response = await fetch(contentUrl, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
      }

      const content = await response.text();

      // Simple chapter splitting logic (you can enhance this based on your needs)
      const chapters = content
        .split(/Chapter \d+/i)
        .filter(text => text.trim().length > 0)
        .map((text, index) => ({
          novelId: id,
          title: `Chapter ${index + 1}`,
          content: text.trim(),
          chapterNumber: index + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

      // Save chapters to database
      await Chapter.insertMany(chapters);

      // Update novel with chapter count
      await Novel.findByIdAndUpdate(id, {
        chapterCount: chapters.length,
        updatedAt: new Date()
      });

      return NextResponse.json({
        message: 'Content processed successfully',
        chaptersCreated: chapters.length
      });

    } catch (error: unknown) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Content processing timed out' },
          { status: 504 }
        );
      }

      throw error;
    }

  } catch (error: unknown) {
    console.error('Error processing content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to process content: ' + errorMessage },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false
  }
}; 