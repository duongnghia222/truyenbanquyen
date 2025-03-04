'use client'

import { BookOpenIcon, HeartIcon } from '@heroicons/react/24/outline'
import { ProfileStatsCard } from './ProfileStatsCard'

interface ReadingStatsType {
  currentlyReading: number
  completed: number
  favorites: number
}

interface ProfileStatsProps {
  readingStats: ReadingStatsType
}

export function ProfileStats({ readingStats }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <ProfileStatsCard
        title="Đang Đọc"
        count={readingStats.currentlyReading}
        icon={<BookOpenIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
        linkUrl="/reading-history"
        linkText="Xem danh sách"
        linkColor="text-blue-600 dark:text-blue-400"
      />
      
      <ProfileStatsCard
        title="Đã Đọc"
        count={readingStats.completed}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600 dark:text-green-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        }
        linkUrl="/reading-history?tab=completed"
        linkText="Xem danh sách"
        linkColor="text-green-600 dark:text-green-400"
      />
      
      <ProfileStatsCard
        title="Yêu Thích"
        count={readingStats.favorites}
        icon={<HeartIcon className="w-6 h-6 text-red-600 dark:text-red-400" />}
        linkUrl="/bookmark"
        linkText="Xem danh sách"
        linkColor="text-red-600 dark:text-red-400"
      />
    </div>
  )
} 