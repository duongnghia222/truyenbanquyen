'use client'

import { Session } from 'next-auth'
import { EnvelopeIcon, CalendarDaysIcon, UserIcon } from '@heroicons/react/24/outline'

interface ProfileUserInfoProps {
  session: Session | null
}

export function ProfileUserInfo({ session }: ProfileUserInfoProps) {
  return (
    <div className="mb-10 pl-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {session?.user?.name || 'Người dùng'}
      </h1>
      
      {/* Username display */}
      <div className="flex items-center gap-2 mt-1.5 text-gray-700 dark:text-gray-300 font-medium">
        <UserIcon className="w-4 h-4" />
        <span>@{session?.user?.username || session?.user?.name?.toLowerCase().replace(/\s/g, '') || 'user'}</span>
      </div>
      
      {session?.user?.email && (
        <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
          <EnvelopeIcon className="w-5 h-5" />
          <span>{session.user.email}</span>
        </div>
      )}
      <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
        <CalendarDaysIcon className="w-5 h-5" />
        <span>Tham gia từ tháng 2, 2024</span>
      </div>
    </div>
  )
} 