import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface Novel {
  _id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  genres: string[];
  status: 'ongoing' | 'completed' | 'hiatus';
  views: number;
  rating: number;
  chapterCount: number;
  createdAt: string;
  updatedAt: string;
}

async function getNovel(id: string): Promise<Novel> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/v1/novels/${id}`, {
    next: {
      revalidate: 3600 // Revalidate every hour
    }
  });
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch novel');
  }
  
  return res.json();
}

export default async function NovelDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const novel = await getNovel(id);
  console.log(novel);

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
            quality={60}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQrJyEwSkNOPzU+PTkzO0BIXE5OQjpAMz9RWVNGS1NfVWlYZVpkUVNf/2wBDARVFx4aHx4lHRglQz43Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
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
                quality={75}
                loading="lazy"
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
                {novel.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{novel.rating.toFixed(1)} / 5 ⭐</span>
                  </div>
                )}
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

              {/* Read Button */}
              <div className="mt-8">
                <Link
                  href={`/novels/${novel._id}/chapters`}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Đọc Truyện
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 