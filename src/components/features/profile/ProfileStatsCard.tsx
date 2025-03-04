'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface ProfileStatsCardProps {
  title: string
  count: number
  icon: ReactNode
  linkUrl: string
  linkText: string
  linkColor: string
}

export function ProfileStatsCard({ 
  title, 
  count, 
  icon, 
  linkUrl, 
  linkText, 
  linkColor 
}: ProfileStatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40">
          {icon}
        </div>
      </div>
      <div className="text-4xl font-bold text-gray-900 dark:text-white">
        {count}
      </div>
      <p className="mt-1 text-gray-600 dark:text-gray-400">truyện</p>
      <Link 
        href={linkUrl}
        className={`mt-4 inline-block ${linkColor} hover:underline`}
      >
        {linkText}
      </Link>
    </div>
  )
} 