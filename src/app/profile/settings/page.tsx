'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  UserIcon, 
  LockClosedIcon,
  BellIcon,
  PaintBrushIcon,
  ArrowLeftIcon,
  CameraIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function ProfileSettingsPage() {
  const { data: session, status, update } = useSession()
  const { theme, toggleTheme } = useTheme()
  
  // Form states
  const [activeTab, setActiveTab] = useState('account') // 'account', 'password', 'notifications', 'appearance'
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    username: session?.user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    chapterUpdates: true,
    systemNotifications: true
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Fetch user profile data
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const fetchUserProfile = async () => {
        try {
          setIsLoading(true)
          setError('')
          
          const response = await fetch('/api/user/profile')
          const data = await response.json()
          
          if (!response.ok) {
            throw new Error(data.message || 'Không thể tải thông tin người dùng')
          }
          
          // Update form data with user profile information
          setFormData(prevData => ({
            ...prevData,
            name: data.user.name || '',
            username: data.user.username || '',
            email: data.user.email || ''
          }))
        } catch (error) {
          console.error('Error fetching user profile:', error)
          setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải thông tin')
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchUserProfile()
    }
  }, [status, session?.user?.id])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData({
      ...formData,
      [name]: checked
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      setError('')
      
      if (activeTab === 'account') {
        // Save account information (name, username)
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            username: formData.username,
          }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật thông tin')
        }
        
        // Update the session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.user.name,
            username: data.user.username
          }
        })
        
      } else if (activeTab === 'password') {
        // Password change logic would go here
      } else if (activeTab === 'notifications') {
        // Notification settings logic would go here
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật thông tin')
    } finally {
      setIsLoading(false)
    }
  }
  
  if (status === 'loading' || isLoading) {
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
          href="/auth/signin?callbackUrl=/profile/settings"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link 
          href="/profile"
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
            hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Cài Đặt Tài Khoản
        </h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="md:flex">
          {/* Sidebar */}
          <div className="md:w-64 bg-gray-50 dark:bg-gray-900/50 p-6 border-r border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="relative w-24 h-24 mx-auto mb-3 group">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'Profile'}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <UserIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 
                  flex items-center justify-center transition-opacity duration-200 cursor-pointer">
                  <CameraIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {session?.user?.name || 'Người dùng'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {session?.user?.email || 'Chưa có email'}
              </p>
            </div>
            
            {/* Navigation */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full px-4 py-2.5 text-left rounded-lg flex items-center gap-3
                  ${activeTab === 'account'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } transition-colors duration-200`}
              >
                <UserIcon className="w-5 h-5" />
                <span>Thông tin cá nhân</span>
              </button>
              
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full px-4 py-2.5 text-left rounded-lg flex items-center gap-3
                  ${activeTab === 'password'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } transition-colors duration-200`}
              >
                <LockClosedIcon className="w-5 h-5" />
                <span>Đổi mật khẩu</span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full px-4 py-2.5 text-left rounded-lg flex items-center gap-3
                  ${activeTab === 'notifications'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } transition-colors duration-200`}
              >
                <BellIcon className="w-5 h-5" />
                <span>Thông báo</span>
              </button>
              
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full px-4 py-2.5 text-left rounded-lg flex items-center gap-3
                  ${activeTab === 'appearance'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } transition-colors duration-200`}
              >
                <PaintBrushIcon className="w-5 h-5" />
                <span>Giao diện</span>
              </button>
            </nav>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-6">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Thông tin cá nhân
                </h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label 
                      htmlFor="name" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Tên hiển thị
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="username" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Tên người dùng
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên người dùng của bạn"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Tên người dùng phải có ít nhất 3 ký tự và là duy nhất
                    </p>
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="email" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium 
                      hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            )}
            
            {/* Password Settings */}
            {activeTab === 'password' && (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Đổi mật khẩu
                </h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label 
                      htmlFor="currentPassword" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="newPassword" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="confirmPassword" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium 
                      hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </button>
                </div>
              </form>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Cài đặt thông báo
                </h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Thông báo qua email</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Nhận thông báo qua email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="emailNotifications"
                        checked={formData.emailNotifications}
                        onChange={handleCheckboxChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                        dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                        after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Thông báo cập nhật chương mới</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Nhận thông báo khi truyện bạn theo dõi có chương mới</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="chapterUpdates"
                        checked={formData.chapterUpdates}
                        onChange={handleCheckboxChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                        dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                        after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Thông báo hệ thống</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Nhận thông báo cập nhật từ hệ thống</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="systemNotifications"
                        checked={formData.systemNotifications}
                        onChange={handleCheckboxChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                        dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                        after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium 
                      hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            )}
            
            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Cài đặt giao diện
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Chế độ tối</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {theme === 'dark' ? 'Chế độ tối đang bật' : 'Chế độ tối đang tắt'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                        dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                        after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 