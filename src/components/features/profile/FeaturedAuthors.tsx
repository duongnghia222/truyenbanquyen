'use client'

import Link from 'next/link'
import { FaUserCircle } from 'react-icons/fa'
import Image from 'next/image'

interface Author {
  id: string
  name: string
  avatar?: string
  description: string
  novels: number
  followers: number
}

// This would typically be fetched from an API
const FEATURED_AUTHORS: Author[] = [
  {
    id: '1',
    name: 'Thiên Tàm Thổ Đậu',
    description: 'Tác giả của nhiều tiểu thuyết nổi tiếng như "Đấu La Đại Lục".',
    novels: 24,
    followers: 15480
  },
  {
    id: '2',
    name: 'Mặc Hương Đồng Khứu',
    description: 'Nhà văn nữ với phong cách viết tiểu thuyết tiên hiệp sắc sảo và đầy cảm xúc.',
    novels: 18,
    followers: 12750
  },
  {
    id: '3',
    name: 'Nhĩ Căn',
    description: 'Tác giả chuyên viết về đề tài tu tiên với tiểu thuyết "Ngã Dục Phong Thiên".',
    novels: 15,
    followers: 9820
  },
  {
    id: '4',
    name: 'Mạc Mặc',
    description: 'Tác giả trẻ với nhiều tiểu thuyết võ hiệp được giới trẻ yêu thích như "Trạch Thiên Ký".',
    novels: 12,
    followers: 8450
  }
]

interface FeaturedAuthorsProps {
  limit?: number
}

export function FeaturedAuthors({ limit = 4 }: FeaturedAuthorsProps) {
  const displayAuthors = FEATURED_AUTHORS.slice(0, limit)
  
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {displayAuthors.map((author) => (
        <Link
          key={author.id}
          href={`/authors/${author.id}`}
          className="group flex flex-col items-center p-5 rounded-xl border border-gray-200 
            dark:border-gray-700 bg-white dark:bg-gray-800 
            transition-all duration-300 hover:shadow-lg
            hover:border-blue-200 dark:hover:border-blue-700"
        >
          <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
            {author.avatar ? (
              <Image
                src={author.avatar}
                alt={author.name}
                fill
                sizes="(max-width: 768px) 96px, 96px"
                className="object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <FaUserCircle className="w-full h-full text-blue-500 dark:text-blue-400 transition-transform duration-300 group-hover:scale-105" />
            )}
            <div className="absolute inset-0 rounded-full border-2 border-blue-200 dark:border-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {author.name}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 line-clamp-2">
            {author.description}
          </p>
          
          <div className="w-full flex items-center justify-around mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {author.novels}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Truyện</p>
            </div>
            
            <div className="flex flex-col items-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatNumber(author.followers)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Người theo dõi</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
} 