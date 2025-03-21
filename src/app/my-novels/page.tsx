'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PlusCircle, Book, Clock, Eye, Star, Loader2, AlertCircle } from 'lucide-react'
import { Novel } from '@/types/novel'

export default function MyNovelsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [novels, setNovels] = useState<Novel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/my-novels')
      return
    }

    // Fetch uploaded novels if authenticated
    if (status === 'authenticated') {
      fetchUploadedNovels()
    }
  }, [status, router])

  const fetchUploadedNovels = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/profile')
      
      if (!response.ok) {
        throw new Error('Failed to fetch uploaded novels')
      }
      
      const data = await response.json()
      setNovels(data.user?.uploadedNovels || [])
    } catch (err) {
      console.error('Error fetching uploaded novels:', err)
      setError('Đã xảy ra lỗi khi tải danh sách truyện đã đăng')
      setNovels([]) // Ensure novels is always an array even on error
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusText = (status: 'ongoing' | 'completed' | 'hiatus') => {
    switch (status) {
      case 'completed': return 'Hoàn Thành'
      case 'ongoing': return 'Đang Ra'
      case 'hiatus': return 'Tạm Dừng'
      default: return 'Đang Ra'
    }
  }

  const getStatusColor = (status: 'ongoing' | 'completed' | 'hiatus') => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
      case 'ongoing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
      case 'hiatus': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center flex-col py-20">
            <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Đang tải truyện của bạn...
            </h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Truyện đã đăng
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Quản lý các truyện bạn đã đăng tải trên hệ thống
            </p>
          </div>
          <Link
            href="/novels/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Đăng truyện mới</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 text-red-600 dark:text-red-400 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {novels.length === 0 && !isLoading && !error ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <Book className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Bạn chưa đăng truyện nào
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Hãy bắt đầu đăng tải tác phẩm đầu tiên của bạn để chia sẻ với cộng đồng độc giả.
            </p>
            <Link
              href="/novels/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Đăng truyện ngay</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {novels && novels.length > 0 && novels.map((novel) => (
              <div 
                key={novel._id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Cover image */}
                  <div className="md:w-1/4 lg:w-1/5">
                    <div className="relative aspect-[2/3] h-full">
                      <Image
                        src={novel.coverImage}
                        alt={novel.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  </div>
                  
                  {/* Novel details */}
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(novel.status)}`}>
                            {getStatusText(novel.status)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(novel.createdAt)}
                          </span>
                        </div>
                        
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Link href={`/novels/${novel.slug}`}>
                            {novel.title}
                          </Link>
                        </h2>
                        
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          <span className="font-medium">Tác giả:</span> {novel.author}
                        </p>
                      </div>
                      
                      <div className="flex gap-4">
                        <Link
                          href={`/novels/${novel.slug}/upload`}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors text-sm"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Thêm chương</span>
                        </Link>
                        
                        <Link
                          href={`/novels/${novel.slug}/edit`}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors text-sm"
                        >
                          <span>Chỉnh sửa</span>
                        </Link>
                      </div>
                    </div>
                    
                    <div className="mt-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                      {novel.description}
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Book className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{novel.chapterCount}</span> chương
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{novel.views.toLocaleString()}</span> lượt xem
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{novel.rating.toFixed(1)}</span>/5
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2 md:mt-0">
                        {novel.genres.slice(0, 2).map((genre) => (
                          <span 
                            key={genre} 
                            className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs text-gray-700 dark:text-gray-300"
                          >
                            {genre}
                          </span>
                        ))}
                        {novel.genres.length > 2 && (
                          <span className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs text-gray-600 dark:text-gray-400">
                            +{novel.genres.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 