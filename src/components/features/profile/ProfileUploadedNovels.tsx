'use client'

import { useState, useEffect } from 'react'
import { NovelCard } from '@/components/features/novels/NovelCard'
import Link from 'next/link'
import { Session } from 'next-auth'
import { PlusCircle } from 'lucide-react'
import { Novel } from '@/types/novel'

interface ProfileUploadedNovelsProps {
  session: Session | null
}

export function ProfileUploadedNovels({ session }: ProfileUploadedNovelsProps) {
  const [uploadedNovels, setUploadedNovels] = useState<Novel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUploadedNovels = async () => {
      if (!session?.user?.id) return
      
      try {
        setIsLoading(true)
        const response = await fetch('/api/user/profile')
        
        if (!response.ok) {
          throw new Error('Không thể tải danh sách truyện')
        }
        
        const data = await response.json()
        // Handle various data structures safely
        if (data.user && Array.isArray(data.user.uploadedNovels)) {
          setUploadedNovels(data.user.uploadedNovels)
        } else if (data.user) {
          // If uploadedNovels is not an array or undefined, use empty array
          setUploadedNovels([])
        } else {
          throw new Error('Dữ liệu không đúng định dạng')
        }
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải danh sách truyện')
        console.error('Error fetching uploaded novels:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUploadedNovels()
  }, [session])

  if (isLoading) {
    return (
      <div className="mt-8 p-6">
        <h2 className="text-xl font-bold mb-4">Truyện Đã Đăng</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8 p-6">
        <h2 className="text-xl font-bold mb-4">Truyện Đã Đăng</h2>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Truyện Đã Đăng</h2>
        <Link 
          href="/novels/upload" 
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Đăng truyện mới</span>
        </Link>
      </div>
      
      {uploadedNovels.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Bạn chưa đăng truyện nào</p>
          <Link 
            href="/novels/upload" 
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Đăng truyện ngay</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {uploadedNovels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      )}
    </div>
  )
} 