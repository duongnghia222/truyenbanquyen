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
  slug: string;
  chapterCount: number;
}

async function getChapter(slug: string, chapterNumber: string): Promise<Chapter> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://truyenlight.com';
  const res = await fetch(
    `${baseUrl}/api/novels/${slug}/chapters/${chapterNumber}`,
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

async function getNovelInfo(slug: string): Promise<NovelInfo> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://truyenlight.com';
  const res = await fetch(
    `${baseUrl}/api/novels/${slug}`,
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
  const res = await fetch(contentUrl, { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error('Failed to fetch chapter content');
  }
  
  return res.text();
}

export default async function ChapterPage({ 
  params 
}: { 
  params: Promise<{ slug: string; chapterNumber: string }>
}) {
  const { slug, chapterNumber } = await params;
  
  try {
    // Get novel info first
    const novel = await getNovelInfo(slug);
    
    // Then get chapter details
    const chapter = await getChapter(slug, chapterNumber);
    
    // Get chapter content
    const content = await getChapterContent(chapter.contentUrl);
    
    // Format date
    const formattedDate = new Date(chapter.createdAt).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Calculate next and previous chapter numbers
    const prevChapter = chapter.chapterNumber > 1 ? chapter.chapterNumber - 1 : null;
    const nextChapter = chapter.chapterNumber < novel.chapterCount ? chapter.chapterNumber + 1 : null;
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <Link 
              href={`/novels/${novel.slug}`}
              className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-500 dark:text-gray-300" />
              <span>Quay lại trang truyện</span>
            </Link>
            
            <Link 
              href={`/novels/${novel.slug}/chapters`}
              className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span>Danh sách chương</span>
            </Link>
          </div>
          
          {/* Chapter Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {chapter.title}
              </h1>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8">
                <span>Đăng ngày: {formattedDate}</span>
                <span className="mx-2">•</span>
                <span>Lượt đọc: {chapter.views.toLocaleString()}</span>
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {content.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? (
                    <p key={index} className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200">
                      {paragraph}
                    </p>
                  ) : <br key={index} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Chapter Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {prevChapter ? (
              <Link 
                href={`/novels/${novel.slug}/chapters/${prevChapter}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-5 py-3 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-500 dark:text-gray-300" />
                <span>Chương trước</span>
              </Link>
            ) : (
              <div className="invisible">
                <span>Placeholder</span>
              </div>
            )}
            
            {nextChapter ? (
              <Link 
                href={`/novels/${novel.slug}/chapters/${nextChapter}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <span>Chương tiếp</span>
                <ChevronRight size={20} />
              </Link>
            ) : (
              <div className="invisible">
                <span>Placeholder</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in ChapterPage:', error);
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Không thể tải nội dung chương
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Đã xảy ra lỗi khi tải nội dung chương. Vui lòng thử lại sau.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href={`/novels/${slug}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <span>Quay lại trang truyện</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
} 