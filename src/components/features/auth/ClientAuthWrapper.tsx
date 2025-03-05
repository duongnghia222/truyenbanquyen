'use client'

import React from 'react'
import { useSession } from 'next-auth/react'

interface ClientAuthWrapperProps {
  authenticatedComponent: React.ReactNode
  unauthenticatedComponent: React.ReactNode
  loadingComponent?: React.ReactNode
}

export default function ClientAuthWrapper({
  authenticatedComponent,
  unauthenticatedComponent,
  loadingComponent
}: ClientAuthWrapperProps) {
  const { status } = useSession()
  
  if (status === 'loading') {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="animate-spin h-8 w-8 border-2 border-gray-300 rounded-full border-t-blue-600"></div>
      </div>
    )
  }
  
  if (status === 'authenticated') {
    return <>{authenticatedComponent}</>
  }
  
  return <>{unauthenticatedComponent}</>
} 