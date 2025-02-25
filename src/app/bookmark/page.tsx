'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { BookmarkIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

// Mock data for bookmarked novels
const mockBookmarks = [
  {
    id: 1,
    title: 'Thiên Đạo Đồ Thư Quán',
    author: 'Hoành Tảo Thiên Nhai',
    cover: 'https://duongnghia222.s3.ap-southeast-2.amazonaws.com/covers/thien-dao-do-thu-quan.jpg',
    slug: 'thien-dao-do-thu-quan',
    rating: 4.5,
    lastChapter: 56,
    totalChapters: 1542,
    lastRead: '2024-02-28T03:25:43.511Z',
    genres: ['Huyền Huyễn', 'Tiên Hiệp'],
    favorite: true
  },
  {
    id: 2,
    title: 'Thần Cấp Thăng Cấp Hệ Thống',
    author: 'Tiểu Lý Phi Đao',
    cover: 'https://duongnghia222.s3.ap-southeast-2.amazonaws.com/covers/than-cap-thang-cap-he-thong.jpg',
    slug: 'than-cap-thang-cap-he-thong',
    rating: 4.2,
    lastChapter: 123,
    totalChapters: 876,
    lastRead: '2024-02-25T15:12:23.511Z',
    genres: ['Hệ Thống', 'Võng Du'],
    favorite: false
  },
  {
    id: 3,
    title: 'Đấu Phá Thương Khung',
    author: 'Thiên Tàm Thổ Đậu',
    cover: 'https://duongnghia222.s3.ap-southeast-2.amazonaws.com/covers/dau-pha-thuong-khung.jpg',
    slug: 'dau-pha-thuong-khung',
    rating: 4.8,
    lastChapter: 234,
    totalChapters: 1245,
    lastRead: '2024-02-26T09:45:32.511Z',
    genres: ['Huyền Huyễn', 'Võ Hiệp'],
    favorite: true
  }
]

export default function BookmarkPage() {
  const { data: session, status } = useSession()
  const [bookmarks, setBookmarks] = useState(mockBookmarks)
  const [filterType, setFilterType] = useState('all') // 'all', 'favorite'
  
  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    setBookmarks(bookmarks.map(book => 
      book.id === id ? {...book, favorite: !book.favorite} : book
    ))
  }
  
  // Remove bookmark
  const removeBookmark = (id: number) => {
    setBookmarks(bookmarks.filter(book => book.id !== id))
  }
  
  // Filter bookmarks
  const filteredBookmarks = filterType === 'all' 
    ? bookmarks 
    : bookmarks.filter(book => book.favorite)
    
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Bạn cần đăng nhập để xem trang này
        </h1>
        <Link 
          href="/signin" 
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600
            text-white font-medium hover:from-purple-600 hover:to-blue-600
            transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-purple-500/20"
        >
          Đăng Nhập
        </Link>
      </div>
    )
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Truyện Đánh Dấu
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Danh sách truyện bạn đã lưu
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterType('favorite')}
            className={`px-4 py-2 rounded-lg ${
              filterType === 'favorite'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Yêu thích
          </button>
        </div>
      </div>
      
      {bookmarks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <BookmarkIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Chưa có truyện nào được đánh dấu
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Hãy tìm kiếm và đánh dấu truyện bạn muốn đọc sau
          </p>
          <Link 
            href="/danh-sach" 
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600
              text-white font-medium hover:from-purple-600 hover:to-blue-600
              transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-purple-500/20"
          >
            Khám phá truyện
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBookmarks.map((book) => (
            <div 
              key={book.id}
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
                      onClick={() => toggleFavorite(book.id)}
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
                      onClick={() => removeBookmark(book.id)}
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
          ))}
        </div>
      )}
    </div>
  )
} 