'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { ProfileHeader } from '@/components/features/profile/ProfileHeader'
import { ProfileUserInfo } from '@/components/features/profile/ProfileUserInfo'
import { ProfileStats } from '@/components/features/profile/ProfileStats'
import { ProfileRecentActivity } from '@/components/features/profile/ProfileRecentActivity'

// Import common components
import { 
  ContentLoader, 
  AuthGuard
} from '@/components/common'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [readingStats, setReadingStats] = useState({
    currentlyReading: 0,
    completed: 0,
    favorites: 0
  })

  // In a real app, you would fetch these stats from an API
  useEffect(() => {
    // Simulating data fetching
    const fetchStats = async () => {
      // This would be an API call in a real application
      setReadingStats({
        currentlyReading: 5,
        completed: 12,
        favorites: 8
      })
    }

    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

  if (status === 'loading') {
    return <ContentLoader />
  }

  if (status === 'unauthenticated') {
    return <AuthGuard callbackUrl="/profile" />
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <ProfileHeader session={session} />
      <ProfileUserInfo session={session} />
      <ProfileStats readingStats={readingStats} />
      <ProfileRecentActivity />
    </div>
  )
} 