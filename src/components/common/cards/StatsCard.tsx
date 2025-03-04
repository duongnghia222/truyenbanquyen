'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { ContentCard } from './ContentCard'

interface StatsCardProps {
  title: string
  count: number
  icon: ReactNode
  linkUrl: string
  linkText: string
  linkColor: string
  suffix?: string
}

export function StatsCard({ 
  title, 
  count, 
  icon, 
  linkUrl, 
  linkText, 
  linkColor,
  suffix = ""
}: StatsCardProps) {
  return (
    <ContentCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40">
          {icon}
        </div>
      </div>
      <div className="text-4xl font-bold text-gray-900 dark:text-white">
        {count}
      </div>
      {suffix && <p className="mt-1 text-gray-600 dark:text-gray-400">{suffix}</p>}
      <Link 
        href={linkUrl}
        className={`mt-4 inline-block ${linkColor} hover:underline`}
      >
        {linkText}
      </Link>
    </ContentCard>
  )
} 