'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { BookOpenIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

// Mock data for reading history
const mockHistory = [
  {
    id: 1,
    title: 'Thiên Đạo Đồ Thư Quán',
    author: 'Hoành Tảo Thiên Nhai',
    cover: 'https://duongnghia222.s3.ap-southeast-2.amazonaws.com/covers/thien-dao-do-thu-quan.jpg',
    slug: 'thien-dao-do-thu-quan',
    lastChapter: 56,
    totalChapters: 1542,
    lastRead: '2024-02-28T03:25:43.511Z',
    progress: 3.6,
    status: 'reading' // 'reading', 'completed', 'on_hold'
  },
  {
    id: 2,
    title: 'Thần Cấp Thăng Cấp Hệ Thống',
    author: 'Tiểu Lý Phi Đao',
    cover: 'https://duongnghia222.s3.ap-southeast-2.amazonaws.com/covers/than-cap-thang-cap-he-thong.jpg',
    slug: 'than-cap-thang-cap-he-thong',
    lastChapter: 123,
    totalChapters: 876,
    lastRead: '2024-02-25T15:12:23.511Z',
    progress: 14.0,
    status: 'reading'
  },
  {
    id: 3,
    title: 'Đấu Phá Thương Khung',
    author: 'Thiên Tàm Thổ Đậu',
    cover: 'https://duongnghia222.s3.ap-southeast-2.amazonaws.com/covers/dau-pha-thuong-khung.jpg',
    slug: 'dau-pha-thuong-khung',
    lastChapter: 1245,
    totalChapters: 1245,
    lastRead: '2024-02-20T09:45:32.511Z',
    progress: 100,
    status: 'completed'
  },
  {
    id: 4,
    title: 'Vô Thường',
    author: 'Tiểu Xuân Tử',
    cover: 'https://duongnghia222.s3.ap-southeast-2.amazonaws.com/covers/vo-thuong.jpg',
    slug: 'vo-thuong',
    lastChapter: 56,
    totalChapters: 342,
    lastRead: '2024-02-10T14:28:52.511Z',
    progress: 16.4,
    status: 'on_hold'
  }
]

export default function ReadingHistoryPage() {
  const { data: session, status } = useSession()
  const [history, setHistory] = useState(mockHistory)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'reading', 'completed', 'on_hold'
  
  // Filter history based on active tab
  const filteredHistory = activeTab === 'all' 
    ? history 
    : history.filter(item => item.status === activeTab)
  
  const tabs = [
    { id: 'all', name: 'Tất cả', count: history.length },
    { id: 'reading', name: 'Đang đọc', count: history.filter(h => h.status === 'reading').length },
    { id: 'completed', name: 'Đã hoàn thành', count: history.filter(h => h.status === 'completed').length },
    { id: 'on_hold', name: 'Tạm dừng', count: history.filter(h => h.status === 'on_hold').length }
  ]
  
  // Update status
  const updateStatus = (id: number, newStatus: string) => {
    setHistory(history.map(item => 
      item.id === id ? {...item, status: newStatus} : item
    ))
  }
  
  useEffect(() => {
    // Get tab from URL query params if present
    const searchParams = new URLSearchParams(window.location.search)
    const tabParam = searchParams.get('tab')
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [])
  
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Lịch Sử Đọc
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Theo dõi tiến độ đọc truyện của bạn
        </p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </div>
      </div>
      
      {filteredHistory.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <BookOpenIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Chưa có lịch sử đọc
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Hãy bắt đầu đọc truyện để ghi lại tiến độ của bạn
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
          {filteredHistory.map((item) => (
            <div 
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg
                border border-gray-200 dark:border-gray-700 transition-all duration-200
                hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900"
            >
              {/* Novel cover */}
              <div className="sm:w-1/6 flex-shrink-0">
                <Link href={`/novels/${item.slug}`}>
                  <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-md">
                    <Image
                      src={item.cover}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Status badge */}
                    {item.status === 'completed' && (
                      <div className="absolute top-0 right-0 m-2 p-1 rounded-full bg-green-500">
                        <CheckCircleIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </Link>
              </div>
              
              {/* Novel details */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <Link href={`/novels/${item.slug}`}>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                        {item.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.author}
                    </p>
                  </div>
                  
                  {/* Status dropdown */}
                  <div className="flex-shrink-0">
                    <select 
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                      className="w-full sm:w-auto px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 
                        dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 text-sm focus:outline-none 
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="reading">Đang đọc</option>
                      <option value="completed">Đã hoàn thành</option>
                      <option value="on_hold">Tạm dừng</option>
                    </select>
                  </div>
                </div>
                
                {/* Reading progress */}
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tiến độ: <span className="font-medium text-gray-900 dark:text-white">{item.progress.toFixed(1)}%</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">Chương {item.lastChapter}</span> / {item.totalChapters}
                    </p>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${
                        item.status === 'completed' 
                          ? 'bg-green-500' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row justify-between sm:items-center">
                  {/* Last read timestamp */}
                  <p className="text-xs text-gray-500 dark:text-gray-500 order-2 sm:order-1">
                    Đọc gần đây: {new Date(item.lastRead).toLocaleDateString('vi-VN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  
                  {/* Continue reading button */}
                  {item.status !== 'completed' && (
                    <Link 
                      href={`/novels/${item.slug}/chapter-${item.lastChapter}`}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700
                        transition-colors duration-200 text-sm mb-2 sm:mb-0 order-1 sm:order-2 self-start"
                    >
                      Tiếp tục đọc
                    </Link>
                  )}
                  
                  {/* Read again button */}
                  {item.status === 'completed' && (
                    <Link 
                      href={`/novels/${item.slug}/chapter-1`}
                      className="px-4 py-1.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700
                        transition-colors duration-200 text-sm mb-2 sm:mb-0 order-1 sm:order-2 self-start"
                    >
                      Đọc lại
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 