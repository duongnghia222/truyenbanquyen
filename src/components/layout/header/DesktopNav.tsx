'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { genres } from './headerData'

export function DesktopNav() {
  const [showGenres, setShowGenres] = useState(false)
  
  return (
    <nav className="hidden md:flex items-center gap-8 ml-12">
      <Link 
        href="/novel-list" 
        className="relative group py-2"
      >
        <span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white
          transition-colors duration-200">
          Danh Sách
        </span>
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600
          transition-all duration-300 group-hover:w-full"></span>
      </Link>
      
      <div className="relative group">
        <button
          onClick={() => setShowGenres(!showGenres)}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-200 group-hover:text-gray-900 
            dark:group-hover:text-white transition-colors duration-200 py-2"
        >
          <span>Thể Loại</span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${
            showGenres ? 'rotate-180' : ''
          }`} />
        </button>
        
        {showGenres && (
          <div className="absolute top-full left-0 mt-2 w-[800px] bg-white dark:bg-gray-800 
            rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 grid grid-cols-3 gap-8
            animate-fade-in-down origin-top z-50">
            {genres.map((column, columnIndex) => (
              <div key={columnIndex} className="space-y-3">
                {column.map((genre) => (
                  <Link
                    key={genre.slug}
                    href={`/the-loai/${genre.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300
                      hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200
                      hover:text-gray-900 dark:hover:text-white"
                  >
                    {genre.icon && (
                      <span className="text-lg">{genre.icon}</span>
                    )}
                    <span>{genre.name}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
} 