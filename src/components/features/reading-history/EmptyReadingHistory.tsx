'use client'

import Link from 'next/link'
import { BookOpenIcon } from '@heroicons/react/24/outline'

export function EmptyReadingHistory() {
  return (
    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <BookOpenIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Chưa có lịch sử đọc
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Hãy bắt đầu đọc truyện để ghi lại tiến độ của bạn
      </p>
      <Link 
        href="/novel-list" 
        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600
          text-white font-medium hover:from-purple-600 hover:to-blue-600
          transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-purple-500/20"
      >
        Khám phá truyện
      </Link>
    </div>
  )
} 