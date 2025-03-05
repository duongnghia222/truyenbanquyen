'use client'

import Link from 'next/link'

interface LoginCTAProps {
  title?: string
  description?: string
  showImage?: boolean
  className?: string
  linkText?: string
  linkUrl?: string
}

export function LoginCTA({
  title = 'Theo dõi tiến độ đọc truyện của bạn',
  description = 'Đăng nhập để lưu lịch sử đọc truyện, đánh dấu truyện yêu thích và nhiều tính năng khác.',
  showImage = true,
  className = '',
  linkText = 'Đăng nhập ngay',
  linkUrl = '/auth/signin'
}: LoginCTAProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden p-6 flex flex-col relative ${className}`}>
      {/* Decorative background gradient */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-60"></div>
      
      <div className="relative z-10">
        <div className="mb-3">
          {showImage && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
              strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-blue-500 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" 
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          )}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>
        
        <Link
          href={linkUrl}
          className="inline-flex items-center gap-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 justify-center mt-auto"
        >
          <span>{linkText}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
            strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
} 