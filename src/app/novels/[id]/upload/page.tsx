import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import UploadChapterForm from '@/components/features/novels/UploadChapterForm';

interface Novel {
  _id: string;
  title: string;
  author: string;
  chapterCount: number;
}

async function getNovel(id: string): Promise<Novel> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/v1/novels/${id}`, {
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
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const novel = await getNovel(id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href={`/novels/${id}/chapters`}
            className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-500 dark:text-gray-300" />
            <span>Quay lại danh sách chương</span>
          </Link>
          
          <Link 
            href={`/novels/${id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Xem trang truyện
          </Link>
        </div>

        {/* Upload Form */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Đăng tải chương mới
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-200">
              Đang đăng tải chương mới cho truyện: <span className="font-semibold text-gray-800 dark:text-white">{novel.title}</span>
            </p>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-300 flex flex-wrap gap-4">
              <span className="inline-flex items-center">
                <span className="font-medium mr-1">Tác giả:</span> 
                <span>{novel.author}</span>
              </span>
              <span className="inline-flex items-center">
                <span className="font-medium mr-1">Số chương hiện tại:</span> 
                <span>{novel.chapterCount}</span>
              </span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/40 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="font-medium mb-2 text-blue-700 dark:text-blue-200">Hướng dẫn đăng tải chương:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700 dark:text-gray-300">
              <li>Mỗi chương cần được tải lên riêng với file .txt</li>
              <li>Đảm bảo đánh số chương chính xác và liên tục</li>
              <li>Kích thước file không vượt quá 1MB</li>
            </ul>
          </div>

          <UploadChapterForm novelId={novel._id} />
        </div>
      </div>
    </div>
  );
} 