'use client'

import { useState } from 'react'
import Link from 'next/link'

// This would typically come from an API call
const MOCK_STATS = {
  totalRead: 42,
  chaptersRead: 358,
  readingTime: 126, // hours
  lastRead: {
    id: '12345',
    title: 'Thiên Long Bát Bộ',
    chapter: 23,
    progress: 75, // percent
  },
  currentStreak: 8, // days
  longestStreak: 15, // days
}

interface ReadingStatsProps {
  compact?: boolean
}

export function ReadingStats({ compact = false }: ReadingStatsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div className={`
      relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700
      bg-white dark:bg-gray-800 transition-all duration-300
      ${compact ? 'p-4' : 'p-6'}
      hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10
      hover:border-blue-200 dark:hover:border-blue-800
    `}>
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full 
        bg-gradient-to-br from-blue-50 to-indigo-50 
        dark:from-blue-950/30 dark:to-indigo-950/30 
        opacity-80" 
      />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Thống kê đọc truyện
          </h3>
          {compact && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              {isExpanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              )}
            </button>
          )}
        </div>
        
        {/* Primary stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Đã đọc</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {MOCK_STATS.totalRead}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">truyện</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Chương</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {MOCK_STATS.chaptersRead}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">đã đọc</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Thời gian</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {MOCK_STATS.readingTime}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">giờ</p>
          </div>
        </div>
        
        {/* Extended stats - hidden in compact mode unless expanded */}
        <div className={`transition-all duration-300 ${compact && !isExpanded ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-96 opacity-100'}`}>
          {/* Current streak */}
          <div className="flex items-center justify-between p-3 mb-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
            <div className="flex items-center gap-3">
              <span className="text-yellow-500 dark:text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Chuỗi đọc hiện tại</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dài nhất: {MOCK_STATS.longestStreak} ngày</p>
              </div>
            </div>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{MOCK_STATS.currentStreak} ngày</p>
          </div>
          
          {/* Last read book with progress */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Truyện gần đây</p>
            <Link href={`/novels/${MOCK_STATS.lastRead.id}`} className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors duration-200">
              <p className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                {MOCK_STATS.lastRead.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Chương {MOCK_STATS.lastRead.chapter}
              </p>
              <div className="relative h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <div 
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                  style={{ width: `${MOCK_STATS.lastRead.progress}%` }}
                ></div>
              </div>
              <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                {MOCK_STATS.lastRead.progress}%
              </p>
            </Link>
          </div>
          
          {/* View full history link */}
          <Link 
            href="/reading-history" 
            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-sm 
            text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 
            border border-blue-200 dark:border-blue-700
            transition-colors duration-200"
          >
            <span>Xem lịch sử đọc truyện</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
} 