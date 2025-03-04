'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchBarProps {
  isMobile?: boolean
  className?: string
}

export function SearchBar({ isMobile = false, className = '' }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  
  return (
    <div className={`relative group ${className}`}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Nhập Tên Truyện..."
        className="w-full px-5 py-2.5 rounded-full bg-gray-50 dark:bg-gray-800 
          border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-400
          focus:outline-none transition-all duration-200 text-gray-900 dark:text-white
          placeholder:text-gray-500 dark:placeholder:text-gray-400"
        autoFocus={isMobile}
      />
      <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full
        text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 
        transition-colors duration-200">
        <MagnifyingGlassIcon className="w-5 h-5" />
      </button>
      {searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl
          shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-fade-in-down z-50">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Đang tìm kiếm: {searchQuery}...
          </div>
        </div>
      )}
    </div>
  )
} 