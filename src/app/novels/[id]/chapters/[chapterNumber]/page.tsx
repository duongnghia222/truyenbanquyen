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

async function getChapter(novelId: string, chapterNumber: string): Promise<Chapter> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(
    `${baseUrl}/api/v1/novels/${novelId}/chapters/${chapterNumber}`,
    { cache: 'no-store' }
  );
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch chapter');
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
  const chapter = await getChapter(id, chapterNumber);
  const content = await getChapterContent(chapter.contentUrl);
  const currentChapter = parseInt(chapterNumber);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            href={`/novels/${id}/chapters`}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-600 shadow-sm hover:bg-gray-50"
          >
            <ChevronLeft size={20} />
            <span>Chapter List</span>
          </Link>

          <div className="flex gap-2">
            {currentChapter > 1 && (
              <Link
                href={`/novels/${id}/chapters/${currentChapter - 1}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-600 shadow-sm hover:bg-gray-50"
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </Link>
            )}
            <Link
              href={`/novels/${id}/chapters/${currentChapter + 1}`}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-600 shadow-sm hover:bg-gray-50"
            >
              <span>Next</span>
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>

        {/* Chapter Content */}
        <div className="rounded-lg bg-white p-6 shadow-xl">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
            {chapter.title}
          </h1>
          <div className="prose prose-lg mx-auto max-w-none">
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
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-600 shadow-sm hover:bg-gray-50"
          >
            <ChevronLeft size={20} />
            <span>Chapter List</span>
          </Link>

          <div className="flex gap-2">
            {currentChapter > 1 && (
              <Link
                href={`/novels/${id}/chapters/${currentChapter - 1}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-600 shadow-sm hover:bg-gray-50"
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </Link>
            )}
            <Link
              href={`/novels/${id}/chapters/${currentChapter + 1}`}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-600 shadow-sm hover:bg-gray-50"
            >
              <span>Next</span>
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 