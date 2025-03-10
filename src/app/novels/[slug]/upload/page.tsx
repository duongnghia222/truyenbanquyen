import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import UploadChapterForm from '@/components/features/novels/UploadChapterForm';

interface Novel {
  _id: string;
  title: string;
  slug: string;
  author: string;
  chapterCount: number;
}

async function getNovel(slug: string): Promise<Novel> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/novels/${slug}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch novel');
  }
  
  return res.json();
}

export default async function UploadChapterPage({ 
  params 
}: { 
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const novel = await getNovel(slug);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href={`/novels/${novel.slug}/chapters`}
            className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-500 dark:text-gray-300" />
            <span>Quay lại danh sách chương</span>
          </Link>
          
          <Link 
            href={`/novels/${novel.slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span>Xem truyện</span>
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Thêm chương mới
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Truyện: {novel.title} - Chương hiện tại: {novel.chapterCount}
            </p>
            
            <UploadChapterForm novelId={novel._id} novelSlug={novel.slug} />
          </div>
        </div>
      </div>
    </div>
  );
} 