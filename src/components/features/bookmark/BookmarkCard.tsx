'use client'

import Image from 'next/image'
import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

export interface BookmarkItem {
  id: number
  title: string
  author: string
  cover: string
  slug: string
  rating: number
  lastChapter: number
  totalChapters: number
  lastRead: string
  genres: string[]
  favorite: boolean
}

interface BookmarkCardProps {
  book: BookmarkItem
  onToggleFavorite: (id: number) => void
  onRemoveBookmark: (id: number) => void
}

export function BookmarkCard({ book, onToggleFavorite, onRemoveBookmark }: BookmarkCardProps) {
  return (
    <div 
      className="flex flex-col sm:flex-row gap-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg
        border border-gray-200 dark:border-gray-700 transition-all duration-200
        hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900"
    >
      {/* Novel cover */}
      <div className="sm:w-1/6">
        <Link href={`/novels/${book.slug}`}>
          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-md">
            <Image
              src={book.cover}
              alt={book.title}
              fill
              className="object-cover"
            />
          </div>
        </Link>
      </div>
      
      {/* Novel details */}
      <div className="flex-1">
        <div className="flex justify-between">
          <div>
            <Link href={`/novels/${book.slug}`}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                {book.title}
              </h2>
            </Link>
            <p className="text-gray-600 dark:text-gray-400">
              {book.author}
            </p>
            
            {/* Genres */}
            <div className="flex flex-wrap gap-2 my-2">
              {book.genres.map((genre, index) => (
                <Link 
                  key={index}
                  href={`/the-loai/${genre.toLowerCase().replace(' ', '-')}`}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full
                    text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600
                    transition-colors duration-200"
                >
                  {genre}
                </Link>
              ))}
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIconSolid 
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.floor(book.rating)
                        ? 'text-yellow-400'
                        : star <= book.rating
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {book.rating}
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <button 
              onClick={() => onToggleFavorite(book.id)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={book.favorite ? "Remove from favorites" : "Add to favorites"}
            >
              {book.favorite ? (
                <StarIconSolid className="w-6 h-6 text-yellow-400" />
              ) : (
                <StarIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              )}
            </button>
            <button 
              onClick={() => onRemoveBookmark(book.id)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
              aria-label="Remove bookmark"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 0 1 1.743-1.342 48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664 19.5 19.5" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Reading progress */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tiến độ đọc: <span className="font-medium text-gray-900 dark:text-white">Chương {book.lastChapter}</span> / {book.totalChapters}
            </p>
          </div>
          <div className="flex-1 max-w-xs">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" 
                style={{ width: `${(book.lastChapter / book.totalChapters) * 100}%` }}
              ></div>
            </div>
          </div>
          <Link 
            href={`/novels/${book.slug}/chapter-${book.lastChapter}`}
            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700
              transition-colors duration-200 text-sm"
          >
            Tiếp tục đọc
          </Link>
        </div>
        
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
          Đọc gần đây: {new Date(book.lastRead).toLocaleDateString('vi-VN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  )
} 