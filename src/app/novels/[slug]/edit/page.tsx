'use client'

import { useState, useEffect, FormEvent, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, AlertCircle, Save, ArrowLeft, Upload, Edit3, BookOpen } from 'lucide-react'

interface Novel {
  _id: string
  title: string
  slug: string
  author: string
  description: string
  coverImage: string
  genres: string[]
  status: 'ongoing' | 'completed' | 'hiatus'
  uploadedBy: string | { _id: string; username?: string }
}

type NovelStatus = 'ongoing' | 'completed' | 'hiatus';

const GENRES = [
  'Hành Động', 'Phiêu Lưu', 'Hài Hước', 'Kịch Tính', 'Giả Tưởng',
  'Kinh Dị', 'Bí Ẩn', 'Lãng Mạn', 'Khoa Học', 'Đời Thường',
  'Siêu Nhiên', 'Gay Cấn', 'Võ Thuật', 'Lịch Sử'
]

const STATUS_LABELS: Record<NovelStatus, string> = {
  ongoing: 'Đang Ra',
  completed: 'Hoàn Thành',
  hiatus: 'Tạm Dừng'
}

const STATUS_COLORS: Record<NovelStatus, string> = {
  ongoing: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800',
  completed: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800',
  hiatus: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800'
}

export default function EditNovelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const novelSlug = params.slug as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [novel, setNovel] = useState<Novel | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    status: 'ongoing',
    genres: [] as string[],
  })
  
  const fetchNovel = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/novels/${novelSlug}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch novel')
      }
      
      const data = await response.json()
      setNovel(data)
      
      // Check if user is the uploader - handle potential format differences or complex object
      const userId = session?.user?.id?.toString();
      let uploaderId;
      
      if (typeof data.uploadedBy === 'string') {
        uploaderId = data.uploadedBy;
      } else if (typeof data.uploadedBy === 'object' && data.uploadedBy?._id) {
        uploaderId = data.uploadedBy._id.toString();
      } else {
        console.error('Unknown format for uploadedBy:', data.uploadedBy);
        uploaderId = null;
      }
      
      if (!userId || !uploaderId || userId !== uploaderId) {
        setError('Bạn không có quyền chỉnh sửa truyện này')
        return
      }
      
      // Set form data
      setFormData({
        title: data.title || '',
        author: data.author || '',
        description: data.description || '',
        status: data.status || 'ongoing',
        genres: data.genres || [],
      })
      
      // Set cover preview
      setCoverPreview(data.coverImage || null)
      setIsLoading(false)
    } catch (err) {
      console.error('Error fetching novel:', err)
      setError('Không thể tải thông tin truyện')
      setIsLoading(false)
    }
  }, [novelSlug, session?.user?.id])
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/novels/${novelSlug}/edit`)
      return
    }
    
    // Fetch novel data if authenticated
    if (status === 'authenticated') {
      fetchNovel()
    }
  }, [status, router, novelSlug, fetchNovel])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear any error when user starts editing
    if (error) setError(null)
  }
  
  const handleGenreToggle = (genre: string) => {
    setFormData(prev => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
      return { ...prev, genres }
    })
    
    // Clear any error when user selects genres
    if (error && error.includes('thể loại')) setError(null)
  }
  
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    processSelectedFile(file)
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }
  
  const handleDragLeave = () => {
    setIsDraggingOver(false)
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    
    processSelectedFile(file)
  }
  
  const processSelectedFile = (file: File) => {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh phải nhỏ hơn 5MB')
      return
    }
    
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Vui lòng tải lên ảnh định dạng JPEG, PNG hoặc WebP')
      return
    }
    
    setNewCoverFile(file)
    
    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverPreview(reader.result as string)
      setSuccessMessage('Đã tải lên ảnh bìa mới thành công')
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    }
    reader.readAsDataURL(file)
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (formData.genres.length === 0) {
      setError('Vui lòng chọn ít nhất một thể loại')
      return
    }
    
    try {
      setIsSaving(true)
      setError(null)
      
      let coverImageUrl = novel?.coverImage
      
      // Upload new cover image if provided
      if (newCoverFile) {
        const imageFormData = new FormData()
        imageFormData.append('file', newCoverFile)
        
        const uploadResponse = await fetch('/api/novels/upload/cover', {
          method: 'POST',
          body: imageFormData,
        })
        
        if (!uploadResponse.ok) {
          throw new Error('Lỗi khi tải lên ảnh bìa mới')
        }
        
        const uploadData = await uploadResponse.json()
        coverImageUrl = uploadData.fileUrl
      }
      
      // Update novel data
      const response = await fetch(`/api/novels/${novelSlug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          coverImage: coverImageUrl,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Không thể cập nhật thông tin truyện')
      }
      
      // Get the updated novel data with the new slug
      const updatedNovel = await response.json()
      
      // Show success before redirecting
      setSuccessMessage('Cập nhật truyện thành công! Đang chuyển hướng...')
      
      // Redirect to novel page using the new slug
      setTimeout(() => {
        router.push(`/novels/${updatedNovel.slug}`)
      }, 1000)
    } catch (err) {
      console.error('Error updating novel:', err)
      setError('Đã xảy ra lỗi khi cập nhật thông tin truyện')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Loading state with skeleton UI
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-md mb-8 animate-pulse"></div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
                  <div className="aspect-[2/3] w-full bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 animate-pulse"></div>
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  
                  <div>
                    <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  
                  <div>
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  
                  <div>
                    <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                    <div className="flex flex-wrap gap-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Permission error state
  if (error && error.includes('quyền')) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-gray-100 dark:border-gray-700 max-w-lg mx-auto transform transition-all animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6 animate-pulse">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Không có quyền truy cập
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              {error}
            </p>
            <Link
              href={`/novels/${novelSlug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all transform hover:scale-105"
            >
              <BookOpen className="w-5 h-5" />
              <span>Quay lại trang truyện</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-10 animate-fadeIn">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href={`/novels/${novelSlug}`}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Chỉnh sửa truyện
            </h1>
          </div>
          
          {novel && (
            <div className={`px-3 py-1.5 rounded-full text-sm font-medium border ${STATUS_COLORS[formData.status as NovelStatus]}`}>
              {STATUS_LABELS[formData.status as NovelStatus]}
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && !error.includes('quyền') && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-600 dark:text-red-400 flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {/* Success message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 text-green-600 dark:text-green-400 flex items-start gap-3 animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>{successMessage}</p>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Left column - Cover image */}
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-blue-500" />
                    Ảnh bìa
                  </h3>
                  <div 
                    className={`relative aspect-[2/3] w-full overflow-hidden rounded-lg border-2 ${
                      isDraggingOver 
                        ? 'border-blue-500 dark:border-blue-400 border-dashed bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                    } transition-colors duration-200 group`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {coverPreview ? (
                      <>
                        <Image
                          src={coverPreview}
                          alt="Cover preview"
                          fill
                          className="object-cover transition-opacity duration-200 group-hover:opacity-70"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="text-white text-center px-3 py-2 rounded-lg bg-black bg-opacity-50 backdrop-blur-sm">
                            <Upload className="w-5 h-5 mx-auto mb-1" />
                            <p className="text-sm">Thay đổi ảnh</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-6 text-center">
                        <Upload className="w-10 h-10 mb-2 opacity-60" />
                        <p className="font-medium">Kéo thả ảnh vào đây hoặc nhấn để chọn ảnh</p>
                        <p className="text-xs mt-2 opacity-70">Hỗ trợ JPEG, PNG, WebP (tối đa 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tải ảnh từ thiết bị
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverChange}
                    className="block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800/30 transition-colors"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Trạng thái
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <label 
                        key={value}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.status === value
                            ? `${STATUS_COLORS[value as NovelStatus]} border-opacity-70`
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={value}
                          checked={formData.status === value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="relative w-4 h-4 rounded-full border-2 border-current mr-3 flex-shrink-0">
                          {formData.status === value && (
                            <span className="absolute inset-0.5 rounded-full bg-current"></span>
                          )}
                        </div>
                        <span className="font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right column - Novel info */}
              <div className="md:col-span-2">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên truyện
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-base px-4 py-3 transition-colors duration-200"
                    placeholder="Nhập tên truyện"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tác giả
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-base px-4 py-3 transition-colors duration-200"
                    placeholder="Nhập tên tác giả"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-base px-4 py-3 transition-colors duration-200"
                    placeholder="Nhập mô tả truyện"
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Mô tả giúp độc giả hiểu về nội dung và tinh thần của truyện.
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Thể loại (chọn ít nhất 1)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 
                          ${formData.genres.includes(genre)
                            ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 transform hover:-translate-y-0.5'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
                          }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    Đã chọn: {formData.genres.length > 0 ? formData.genres.join(', ') : 'Chưa chọn thể loại nào'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-4">
              <Link
                href={`/novels/${novelSlug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Huỷ bỏ</span>
              </Link>
              
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang lưu thay đổi...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 