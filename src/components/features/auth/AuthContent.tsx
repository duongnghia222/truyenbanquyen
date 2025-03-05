'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface AuthContentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loginUrl?: string
  loginMessage?: string
  hideLoginButton?: boolean
}

export function AuthContent({ 
  children, 
  fallback, 
  loginUrl = '/auth/signin', 
  loginMessage = 'Đăng nhập để xem nội dung này',
  hideLoginButton = false
}: AuthContentProps) {
  const { status } = useSession()
  
  // If authentication is loading, show a simple loading state
  if (status === 'loading') {
    return (
      <div className="animate-pulse p-4 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin"></div>
      </div>
    )
  }
  
  // If authenticated, show the actual content
  if (status === 'authenticated') {
    return <>{children}</>
  }
  
  // If not authenticated and there's a fallback provided, show that
  if (fallback) {
    return <>{fallback}</>
  }
  
  // Default not authenticated view
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 flex flex-col items-center justify-center w-full h-full">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} 
        stroke="currentColor" className="w-10 h-10 text-blue-500 mb-3">
        <path strokeLinecap="round" strokeLinejoin="round" 
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
      
      <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
        {loginMessage}
      </p>
      
      {!hideLoginButton && (
        <Link
          href={loginUrl}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
        >
          Đăng nhập
        </Link>
      )}
    </div>
  )
} 