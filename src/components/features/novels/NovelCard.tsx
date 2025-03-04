'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface NovelCardProps {
  novel: {
    _id: string;
    title: string;
    author: string;
    description: string;
    coverImage: string;
    genres: string[];
    status: 'ongoing' | 'completed' | 'hiatus';
    rating: number;
    views: number;
  };
}

export function NovelCard({ novel }: NovelCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const getStatusText = (status: 'ongoing' | 'completed' | 'hiatus') => {
    switch (status) {
      case 'completed':
        return 'Hoàn Thành';
      case 'ongoing':
        return 'Đang Ra';
      case 'hiatus':
        return 'Tạm Dừng';
      default:
        return 'Đang Ra';
    }
  };

  const getStatusColor = (status: 'ongoing' | 'completed' | 'hiatus') => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-800/70 dark:text-green-100';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800/70 dark:text-blue-100';
      case 'hiatus':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-800/70 dark:text-amber-100';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800/70 dark:text-blue-100';
    }
  };

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`full-${i}`} className="w-3.5 h-3.5 text-yellow-400" filled />
        ))}
        {hasHalfStar && <HalfStarIcon className="w-3.5 h-3.5 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <StarIcon key={`empty-${i}`} className="w-3.5 h-3.5 text-gray-300 dark:text-gray-500" filled={false} />
        ))}
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <Link href={`/novels/${novel._id}`} className="group block h-full">
      <div className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full transition-all duration-300 
        hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 
        hover:border-blue-300 dark:hover:border-blue-700">
        {/* Status badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(novel.status)}`}>
            {getStatusText(novel.status)}
          </span>
        </div>
        
        {/* Cover image with gradient overlay */}
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <div className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse ${imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} />
          <Image
            src={novel.coverImage}
            alt={novel.title}
            fill
            className={`object-cover transition-all duration-500 ease-out ${imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'} group-hover:scale-105`}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
            quality={90}
            onLoadingComplete={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Views counter */}
          <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
              <EyeIcon className="h-3 w-3" />
              {novel.views.toLocaleString()}
            </span>
          </div>
        </div>
        
        {/* Content - fixed height to ensure consistency */}
        <div className="p-4 flex-1 flex flex-col min-h-[130px]">
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 line-clamp-2 transition-colors duration-300">
            {novel.title}
          </h3>
          
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-200 line-clamp-1">{novel.author}</p>
          
          {/* Rating */}
          <div className="mt-2">
            {renderRatingStars(novel.rating)}
          </div>
          
          {/* Genres - pushed to bottom with mt-auto */}
          <div className="mt-auto pt-3 flex flex-wrap gap-1.5">
            {novel.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="inline-block rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-700 dark:text-gray-200 border border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-600 transition-colors duration-300"
              >
                {genre}
              </span>
            ))}
            {novel.genres.length > 2 && (
              <span className="inline-block rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300 border border-transparent">
                +{novel.genres.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Icon components
function StarIcon({ className, filled = true }: { className?: string; filled?: boolean }) {
  return filled ? (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ) : (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function HalfStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="half-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="#D1D5DB" className="dark:stop-color-gray-600" />
        </linearGradient>
      </defs>
      <path
        fill="url(#half-gradient)"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
} 