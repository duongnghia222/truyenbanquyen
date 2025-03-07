'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { UserIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

export function UserMenu() {
  const { data: session, status } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside the user menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current && 
        userMenuButtonRef.current && 
        !userMenuRef.current.contains(e.target as Node) && 
        !userMenuButtonRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // If not authenticated, show login link
  if (status !== 'authenticated') {
    return (
      <Link 
        href="/auth/signin"
        className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <UserIcon className="h-5 w-5" />
        <span>Đăng nhập</span>
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        ref={userMenuButtonRef}
        className="group flex items-center gap-2"
        onClick={() => setShowUserMenu(!showUserMenu)}
      >
        <div className="flex-shrink-0 h-9 w-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all duration-200">
          {session?.user?.image ? (
            <Image 
              src={session.user.image}
              alt="Avatar"
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </div>
        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${
          showUserMenu ? 'rotate-180' : ''
        }`} />
      </button>

      {showUserMenu && (
        <div 
          ref={userMenuRef}
          className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                {session?.user?.image ? (
                  <Image 
                    src={session.user.image}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {session?.user?.name || session?.user?.username || 'User'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {session?.user?.email || ''}
                </div>
              </div>
            </div>
          </div>
          
          <div className="py-1">
            <Link 
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowUserMenu(false)}
            >
              Trang cá nhân
            </Link>
            <Link 
              href="/bookmark"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowUserMenu(false)}
            >
              Truyện đánh dấu
            </Link>
            <Link 
              href="/reading-history"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowUserMenu(false)}
            >
              Lịch sử đọc
            </Link>
            <Link 
              href="/notifications"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowUserMenu(false)}
            >
              Thông báo
            </Link>
            <Link 
              href="/profile/settings"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowUserMenu(false)}
            >
              Cài đặt tài khoản
            </Link>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <button
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                signOut({ callbackUrl: '/auth/signin' });
                setShowUserMenu(false);
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 