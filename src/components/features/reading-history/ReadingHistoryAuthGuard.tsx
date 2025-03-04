'use client'

import Link from 'next/link'

export function ReadingHistoryAuthGuard() {
  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Bạn cần đăng nhập để xem trang này
      </h1>
      <Link
        href="/auth/signin?callbackUrl=/reading-history"
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Đăng nhập
      </Link>
    </div>
  )
} 