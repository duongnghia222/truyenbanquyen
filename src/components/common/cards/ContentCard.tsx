'use client'

import { ReactNode } from 'react'

interface ContentCardProps {
  children: ReactNode
  className?: string
}

export function ContentCard({ children, className = "" }: ContentCardProps) {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 
        border border-gray-200 dark:border-gray-700 transition-all duration-200
        hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 ${className}`}
    >
      {children}
    </div>
  )
} 