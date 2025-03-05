'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { BellIcon, XMarkIcon, BookOpenIcon, CheckIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: 'chapter_update',
    title: 'Thiên Đạo Đồ Thư Quán có chương mới',
    message: 'Chương 57: Khám phá bí mật của Đạo Tàng',
    link: '/novels/thien-dao-do-thu-quan/chapter-57',
    createdAt: '2024-02-28T09:25:43.511Z',
    read: false
  },
  {
    id: 2,
    type: 'system',
    title: 'Chào mừng đến với TruyenLight',
    message: 'Cảm ơn bạn đã đăng ký tài khoản. Khám phá và đọc ngay hàng ngàn truyện hay.',
    link: null,
    createdAt: '2024-02-26T15:12:23.511Z',
    read: true
  },
  {
    id: 3,
    type: 'chapter_update',
    title: 'Thần Cấp Thăng Cấp Hệ Thống có chương mới',
    message: 'Chương 124: Đột phá cảnh giới',
    link: '/novels/than-cap-thang-cap-he-thong/chapter-124',
    createdAt: '2024-02-25T18:45:32.511Z',
    read: false
  },
  {
    id: 4,
    type: 'achievement',
    title: 'Đã đạt thành tích mới',
    message: 'Bạn đã đọc 50 chương trong tuần này',
    link: '/profile#achievements',
    createdAt: '2024-02-24T12:28:52.511Z',
    read: true
  }
]

export default function NotificationsPage() {
  const { status } = useSession()
  const [notifications, setNotifications] = useState(mockNotifications)
  
  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? {...notification, read: true} : notification
    ))
  }
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification, 
      read: true
    })))
  }
  
  // Delete notification
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id))
  }
  
  // Clear all read notifications
  const clearReadNotifications = () => {
    setNotifications(notifications.filter(notification => !notification.read))
  }
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chapter_update':
        return <BookOpenIcon className="w-5 h-5" />
      case 'achievement':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
          </svg>
        )
      case 'system':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
        )
      default:
        return <BellIcon className="w-5 h-5" />
    }
  }
  
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
          href="/auth/signin?callbackUrl=/notifications"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Thông Báo
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-sm font-semibold px-2.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Cập nhật về truyện và hệ thống
          </p>
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-100 text-blue-700
                dark:bg-blue-900/50 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900
                transition-colors duration-200 flex items-center gap-1"
            >
              <CheckIcon className="w-4 h-4" />
              Đánh dấu đã đọc
            </button>
          )}
          
          <button
            onClick={clearReadNotifications}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700
              dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700
              transition-colors duration-200 flex items-center gap-1"
          >
            <XMarkIcon className="w-4 h-4" />
            Xóa đã đọc
          </button>
        </div>
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <BellIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Không có thông báo nào
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Các thông báo về cập nhật truyện và hệ thống sẽ xuất hiện ở đây
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border
                p-4 transition-all duration-200 hover:shadow-lg ${
                notification.read 
                  ? 'border-gray-200 dark:border-gray-700' 
                  : 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/10'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 p-2 rounded-full ${
                  notification.read
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    notification.read
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-blue-800 dark:text-blue-300'
                  }`}>
                    {notification.title}
                  </h3>
                  <p className={`mt-1 ${
                    notification.read 
                      ? 'text-gray-600 dark:text-gray-400' 
                      : 'text-blue-700 dark:text-blue-400'
                  }`}>
                    {notification.message}
                  </p>
                  
                  <div className="mt-2 flex items-center justify-between">
                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                      <ClockIcon className="w-3.5 h-3.5" />
                      <span>
                        {new Date(notification.createdAt).toLocaleDateString('vi-VN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {notification.link && (
                        <Link 
                          href={notification.link}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Xem chi tiết
                        </Link>
                      )}
                      
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          aria-label="Đánh dấu đã đọc"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        aria-label="Xóa thông báo"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Load more button */}
          <div className="text-center pt-4">
            <button className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
              text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
              transition-colors duration-200 flex items-center gap-2 mx-auto">
              <ArrowPathIcon className="w-4 h-4" />
              Tải thêm
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 