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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          href={`/novels/${id}/chapters`}
          className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-600 shadow-sm hover:bg-gray-50"
        >
          <ChevronLeft size={20} />
          <span>Back to Chapters</span>
        </Link>

        {/* Upload Form */}
        <div className="rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Đăng tải chương mới
            </h1>
            <p className="mt-2 text-gray-600">
              Đang đăng tải chương mới cho truyện: {novel.title}
            </p>
            <p className="text-sm text-gray-500">
              Tác giả: {novel.author} | Số chương hiện tại: {novel.chapterCount}
            </p>
          </div>

          <UploadChapterForm novelId={novel._id} />
        </div>
      </div>
    </div>
  );
} 