'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import { genres } from './headerData'

interface MobileMenuProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

export function MobileMenu({ isOpen, onToggle, onClose }: MobileMenuProps) {
  const { data: session } = useSession()
  const [showGenres, setShowGenres] = useState(false)

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (!target.closest('#mobile-menu-content') && !target.closest('#menu-toggle')) {
          onClose()
        }
      }
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile menu button */}
      <button 
        id="menu-toggle"
        className="md:hidden p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 
          dark:hover:bg-gray-800 rounded-lg transition-colors z-10"
        onClick={onToggle}
        aria-label="Toggle mobile menu"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 ${isOpen ? 'visible' : 'invisible'}`}>
        {/* Overlay - clicking this will close the menu */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
          aria-hidden="true"
        ></div>
        
        {/* Menu Content */}
        <div 
          id="mobile-menu-content"
          className={`absolute top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-gray-900 
            shadow-xl transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800
              text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700
              transition-colors duration-200 z-50"
            onClick={onClose}
            aria-label="Close menu"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          <div className="pt-16 px-6 pb-8 h-full overflow-y-auto">
            <nav className="flex flex-col gap-4">
              <Link 
                href="/novel-list" 
                className="text-lg font-medium text-gray-900 dark:text-white py-3 border-b border-gray-100 dark:border-gray-800
                  flex items-center justify-between"
                onClick={onClose}
              >
                <span>Danh Sách</span>
              </Link>
              
              <div className="py-3 border-b border-gray-100 dark:border-gray-800">
                <div 
                  className="text-lg font-medium text-gray-900 dark:text-white 
                    flex items-center justify-between cursor-pointer"
                  onClick={() => setShowGenres(!showGenres)}
                >
                  <span>Thể Loại</span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${
                    showGenres ? 'rotate-180' : ''
                  }`} />
                </div>
                
                {showGenres && (
                  <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-2">
                    {genres.flat().map((genre) => (
                      <Link
                        key={genre.slug}
                        href={`/the-loai/${genre.slug}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300
                          hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        onClick={onClose}
                      >
                        {genre.icon && (
                          <span className="text-lg">{genre.icon}</span>
                        )}
                        <span>{genre.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <Link 
                href="/help" 
                className="text-lg font-medium text-gray-900 dark:text-white py-3 border-b border-gray-100 dark:border-gray-800
                  flex items-center gap-3"
                onClick={onClose}
              >
                <QuestionMarkCircleIcon className="w-6 h-6" />
                <span>Trợ Giúp</span>
              </Link>

              {!session && (
                <div className="mt-6">
                  <Link
                    href="/signin"
                    className="w-full flex justify-center py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600
                      text-white font-medium hover:from-purple-600 hover:to-blue-600
                      transition-all duration-300 shadow-lg"
                    onClick={onClose}
                  >
                    Đăng Nhập
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </>
  )
} 