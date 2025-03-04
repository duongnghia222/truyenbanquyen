'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useMemo } from 'react'
import { mockHistory, ReadingHistoryItem } from '@/components/features/reading-history/ReadingHistoryData'
import { ReadingHistoryList } from '@/components/features/reading-history/ReadingHistoryList'
import { BookOpenIcon } from '@heroicons/react/24/outline'

// Import common components
import { 
  PageHeader, 
  FilterTabs, 
  ContentLoader, 
  AuthGuard,
  EmptyState
} from '@/components/common'

export default function ReadingHistoryPage() {
  const { status } = useSession()
  const [history, setHistory] = useState(mockHistory)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'reading', 'completed', 'on_hold'
  
  const tabs = useMemo(() => [
    { id: 'all', label: 'Tất cả', count: history.length },
    { id: 'reading', label: 'Đang đọc', count: history.filter(h => h.status === 'reading').length },
    { id: 'completed', label: 'Đã hoàn thành', count: history.filter(h => h.status === 'completed').length },
    { id: 'on_hold', label: 'Tạm dừng', count: history.filter(h => h.status === 'on_hold').length }
  ], [history]);
  
  // Filter history based on active tab
  const filteredHistory = activeTab === 'all' 
    ? history 
    : history.filter(item => item.status === activeTab)
  
  // Update status
  const updateStatus = (id: number, newStatus: string) => {
    setHistory(history.map(item => 
      item.id === id 
        ? {...item, status: newStatus as ReadingHistoryItem['status']} 
        : item
    ))
  }
  
  useEffect(() => {
    // Get tab from URL query params if present
    const searchParams = new URLSearchParams(window.location.search)
    const tabParam = searchParams.get('tab')
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabs])
  
  if (status === 'loading') {
    return <ContentLoader />
  }
  
  if (status === 'unauthenticated') {
    return <AuthGuard callbackUrl="/reading-history" />
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader 
        title="Lịch sử đọc truyện" 
        description="Theo dõi các truyện bạn đã và đang đọc"
      />
      
      <FilterTabs 
        tabs={tabs} 
        activeTabId={activeTab} 
        onTabChange={setActiveTab} 
        className="mb-6"
      />
      
      {filteredHistory.length > 0 ? (
        <ReadingHistoryList 
          items={filteredHistory}
          onUpdateStatus={updateStatus}
        />
      ) : (
        <EmptyState
          icon={<BookOpenIcon className="w-12 h-12" />}
          title="Không có lịch sử đọc truyện"
          description="Bạn chưa có lịch sử đọc truyện nào trong danh mục này"
          actionLink="/comics"
          actionText="Khám phá truyện ngay"
        />
      )}
    </div>
  )
} 