import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

async function getNovel(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/v1/novels/${id}`, {
    cache: 'no-store' // Disable cache to always get fresh data
  });
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch novel');
  }
  
  return res.json();
}

export default async function NovelDetailPage({ params }: { params: { id: string } }) {
  const novel = await getNovel(params.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Cover Image */}
      <div className="relative h-[40vh] w-full">
        <div className="absolute inset-0">
          <Image
            src={novel.coverImage}
            alt={novel.title}
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        
        {/* Back Button */}
        <Link 
          href="/"
          className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-sm hover:bg-white/20"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </Link>
      </div>

      {/* Novel Info Section */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-32 rounded-lg bg-white p-6 shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* Cover Image */}
            <div className="relative aspect-[2/3] w-full max-w-[240px] shrink-0 overflow-hidden rounded-lg shadow-lg">
              <Image
                src={novel.coverImage}
                alt={novel.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 240px, 240px"
                priority
              />
            </div>

            {/* Novel Details */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{novel.title}</h1>
              <p className="mt-2 text-lg text-gray-600">by {novel.author}</p>
              
              {/* Stats */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {novel.status === 'completed' ? 'Hoàn Thành' : 
                     novel.status === 'ongoing' ? 'Đang Ra' : 'Tạm Dừng'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{novel.views.toLocaleString()} lượt xem</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{novel.chapterCount} chương</span>
                </div>
              </div>

              {/* Genres */}
              <div className="mt-4 flex flex-wrap gap-2">
                {novel.genres.map((genre: string) => (
                  <span
                    key={genre}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-900">Giới thiệu truyện</h2>
                <p className="mt-2 whitespace-pre-line text-gray-600">{novel.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Section - Placeholder for now */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900">Danh sách chương</h2>
          <div className="mt-4">
            {/* We'll implement the chapters list in the next iteration */}
            <p className="text-gray-600">Danh sách chương sẽ được hiển thị ở đây...</p>
          </div>
        </div>
      </div>
    </div>
  );
} 