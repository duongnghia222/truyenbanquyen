'use client';

import Image from 'next/image';
import Link from 'next/link';

interface NovelCardProps {
  novel: {
    _id: string;
    title: string;
    author: string;
    description: string;
    coverImage: string;
    genres: string[];
    status: string;
    rating: number;
    views: number;
  };
}

export function NovelCard({ novel }: NovelCardProps) {
  return (
    <Link href={`/novels/${novel._id}`} className="group">
      <div className="relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={novel.coverImage}
            alt={novel.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
            priority={false}
            quality={75}
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">
            {novel.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{novel.author}</p>
          <div className="mt-2 flex items-center gap-2">
            {novel.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                {genre}
              </span>
            ))}
            {novel.genres.length > 2 && (
              <span className="text-xs text-gray-400">+{novel.genres.length - 2}</span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
            <span className={`${
              novel.status === 'completed' ? 'text-green-600' : 
              novel.status === 'ongoing' ? 'text-blue-600' : 'text-yellow-600'
            }`}>
              {novel.status === 'completed' ? 'Hoàn Thành' : 
               novel.status === 'ongoing' ? 'Đang Ra' : 'Tạm Dừng'}
            </span>
            <span>{novel.views.toLocaleString()} lượt xem</span>
          </div>
        </div>
      </div>
    </Link>
  );
} 