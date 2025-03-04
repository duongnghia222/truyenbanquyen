'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  actionLink: string
  actionText: string
  gradientStart?: string
  gradientEnd?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLink,
  actionText,
  gradientStart = "from-blue-600",
  gradientEnd = "to-purple-600"
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="mx-auto mb-4 text-gray-400 dark:text-gray-500">
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {description}
      </p>
      <Link 
        href={actionLink} 
        className={`px-6 py-2.5 rounded-full bg-gradient-to-r ${gradientStart} ${gradientEnd}
          text-white font-medium hover:${gradientEnd} hover:${gradientStart}
          transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-purple-500/20`}
      >
        {actionText}
      </Link>
    </div>
  )
} 