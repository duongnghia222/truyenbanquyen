'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Genre {
  id: string
  name: string
  icon: string
  count: number
}

const POPULAR_GENRES: Genre[] = [
  { id: 'fantasy', name: 'Kỳ Ảo', icon: '🧙‍♂️', count: 120 },
  { id: 'action', name: 'Hành Động', icon: '⚔️', count: 95 },
  { id: 'romance', name: 'Tình Cảm', icon: '❤️', count: 150 },
  { id: 'mystery', name: 'Trinh Thám', icon: '🔍', count: 80 },
  { id: 'scifi', name: 'Khoa Học', icon: '🚀', count: 60 },
  { id: 'horror', name: 'Kinh Dị', icon: '👻', count: 45 },
  { id: 'historical', name: 'Lịch Sử', icon: '📜', count: 55 },
  { id: 'comedy', name: 'Hài Hước', icon: '😂', count: 110 },
  { id: 'adventure', name: 'Phiêu Lưu', icon: '🏔️', count: 100 },
  { id: 'drama', name: 'Kịch Tính', icon: '🎭', count: 85 },
]

interface GenreBrowserProps {
  limit?: number
}

export function GenreBrowser({ limit = 8 }: GenreBrowserProps) {
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null)
  const displayGenres = POPULAR_GENRES.slice(0, limit)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {displayGenres.map((genre) => (
        <Link
          key={genre.id}
          href={`/genres/${genre.id}`}
          className={`
            relative overflow-hidden rounded-xl border p-5 
            transition-all duration-300 group
            ${hoveredGenre === genre.id
              ? 'border-blue-400 shadow-md shadow-blue-100 dark:border-blue-500 dark:shadow-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
            }
          `}
          onMouseEnter={() => setHoveredGenre(genre.id)}
          onMouseLeave={() => setHoveredGenre(null)}
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full 
            bg-gradient-to-br from-blue-100 to-purple-100 
            dark:from-blue-900/20 dark:to-purple-900/20 
            transition-all duration-500 ease-out 
            group-hover:scale-125 opacity-50" 
          />
          
          <div className="relative">
            <div className="mb-3 text-3xl">{genre.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{genre.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{genre.count} truyện</p>
          </div>
          
          <div className="absolute bottom-3 right-3 opacity-0 transform translate-y-1 
            group-hover:opacity-100 group-hover:translate-y-0 
            transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} 
              stroke="currentColor" className="w-4 h-4 text-blue-600 dark:text-blue-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  )
} 