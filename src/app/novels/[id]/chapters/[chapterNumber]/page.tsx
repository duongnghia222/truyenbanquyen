import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';

interface Chapter {
  _id: string;
  title: string;
  contentUrl: string;
  chapterNumber: number;
  views: number;
  createdAt: string;
}

interface NovelInfo {
  _id: string;
  title: string;
  chapterCount: number;
}

async function getChapter(novelId: string, chapterNumber: string): Promise<Chapter> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(
    `${baseUrl}/api/novels/${novelId}/chapters/${chapterNumber}`,
    {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch chapter');
  }
  
  return res.json();
}

async function getNovelInfo(novelId: string): Promise<NovelInfo> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(
    `${baseUrl}/api/novels/${novelId}`,
    {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch novel info');
  }
  
  return res.json();
}

async function getChapterContent(contentUrl: string): Promise<string> {
  const res = await fetch(contentUrl);
  
  if (!res.ok) {
    throw new Error('Failed to fetch chapter content');
  }
  
  return res.text();
}

export default async function ChapterPage({ 
  params 
}: { 
  params: Promise<{ id: string; chapterNumber: string }>
}) {
  const { id, chapterNumber } = await params;
  const currentChapter = parseInt(chapterNumber);
  
  // Get current chapter data
  const chapter = await getChapter(id, chapterNumber);
  const content = await getChapterContent(chapter.contentUrl);
  
  // Get novel info to check total chapters
  const novel = await getNovelInfo(id);
  
  // Check if next chapter exists
  const nextChapterExists = currentChapter < novel.chapterCount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            href={`/novels/${id}/chapters`}
            className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Chapter List</span>
          </Link>

          <div className="flex gap-2">
            {currentChapter > 1 && (
              <Link
                href={`/novels/${id}/chapters/${currentChapter - 1}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </Link>
            )}
            {nextChapterExists && (
              <Link
                href={`/novels/${id}/chapters/${currentChapter + 1}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </Link>
            )}
          </div>
        </div>

        {/* Chapter Content */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
            {chapter.title}
          </h1>
          <div className="prose prose-lg dark:prose-invert mx-auto max-w-none text-gray-800 dark:text-gray-200">
            {content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Link 
            href={`/novels/${id}/chapters`}
            className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Chapter List</span>
          </Link>

          <div className="flex gap-2">
            {currentChapter > 1 && (
              <Link
                href={`/novels/${id}/chapters/${currentChapter - 1}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </Link>
            )}
            {nextChapterExists && (
              <Link
                href={`/novels/${id}/chapters/${currentChapter + 1}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 