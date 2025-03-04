'use client'

import Link from 'next/link'

interface AuthGuardProps {
  callbackUrl: string
  title?: string
  message?: string
  buttonText?: string
}

export function AuthGuard({ 
  callbackUrl,
  title = "Bạn cần đăng nhập để xem trang này",
  message,
  buttonText = "Đăng nhập"
}: AuthGuardProps) {
  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        {title}
      </h1>
      {message && (
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>
      )}
      <Link
        href={`/auth/signin?callbackUrl=${callbackUrl}`}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        {buttonText}
      </Link>
    </div>
  )
} 