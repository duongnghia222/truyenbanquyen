'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { 
  UserIcon, 
  BookOpenIcon,
  HeartIcon, 
  EnvelopeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [readingStats, setReadingStats] = useState({
    currentlyReading: 0,
    completed: 0,
    favorites: 0
  })

  // In a real app, you would fetch these stats from an API
  useEffect(() => {
    // Simulating data fetching
    const fetchStats = async () => {
      // This would be an API call in a real application
      setReadingStats({
        currentlyReading: 5,
        completed: 12,
        favorites: 8
      })
    }

    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

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
          href="/auth/signin?callbackUrl=/profile"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header with cover image */}
      <div className="relative mb-24">
        <div className="h-64 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"></div>
        
        {/* Profile picture */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative ring-4 ring-white dark:ring-gray-900 rounded-full">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'Profile'}
                width={128}
                height={128}
                className="rounded-full"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <UserIcon className="w-16 h-16 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>
        </div>
        
        {/* Settings button */}
        <div className="absolute bottom-4 right-4">
          <Link 
            href="/profile/settings"
            className="px-5 py-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200
              shadow-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Cài đặt
          </Link>
        </div>
      </div>
      
      {/* User Info */}
      <div className="mb-10 pl-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {session?.user?.name || 'Người dùng'}
        </h1>
        {session?.user?.email && (
          <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
            <EnvelopeIcon className="w-5 h-5" />
            <span>{session.user.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
          <CalendarDaysIcon className="w-5 h-5" />
          <span>Tham gia từ tháng 2, 2024</span>
        </div>
      </div>
      
      {/* Reading Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Đang Đọc</h2>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40">
              <BookOpenIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {readingStats.currentlyReading}
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-400">truyện</p>
          <Link 
            href="/reading-history"
            className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
          >
            Xem danh sách
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Đã Đọc</h2>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/40">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600 dark:text-green-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {readingStats.completed}
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-400">truyện</p>
          <Link 
            href="/reading-history?tab=completed"
            className="mt-4 inline-block text-green-600 dark:text-green-400 hover:underline"
          >
            Xem danh sách
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yêu Thích</h2>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/40">
              <HeartIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {readingStats.favorites}
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-400">truyện</p>
          <Link 
            href="/bookmark"
            className="mt-4 inline-block text-red-600 dark:text-red-400 hover:underline"
          >
            Xem danh sách
          </Link>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Hoạt Động Gần Đây</h2>
        
        <div className="space-y-6">
          {/* If no activity yet */}
          {true && (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">
                Chưa có hoạt động nào gần đây
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 