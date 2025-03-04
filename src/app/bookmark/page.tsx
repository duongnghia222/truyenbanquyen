'use client'

import { useSession } from 'next-auth/react'
import { useState, useMemo } from 'react'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { mockBookmarks } from '@/components/features/bookmark/BookmarkData'
import { BookmarkList } from '@/components/features/bookmark/BookmarkList'

// Import common components
import { 
  PageHeader, 
  FilterTabs, 
  ContentLoader, 
  AuthGuard,
  EmptyState
} from '@/components/common'

export default function BookmarkPage() {
  const { status } = useSession()
  const [bookmarks, setBookmarks] = useState(mockBookmarks)
  const [filterType, setFilterType] = useState('all') // 'all', 'favorite'
  
  // Define tabs
  const tabs = useMemo(() => [
    { id: 'all', label: 'Tất cả', count: bookmarks.length },
    { id: 'favorite', label: 'Yêu thích', count: bookmarks.filter(b => b.favorite).length },
  ], [bookmarks]);
  
  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    setBookmarks(bookmarks.map(book => 
      book.id === id ? {...book, favorite: !book.favorite} : book
    ))
  }
  
  // Remove bookmark
  const removeBookmark = (id: number) => {
    setBookmarks(bookmarks.filter(book => book.id !== id))
  }
  
  // Filter bookmarks
  const filteredBookmarks = filterType === 'all' 
    ? bookmarks 
    : bookmarks.filter(book => book.favorite)
    
  if (status === 'loading') {
    return <ContentLoader />
  }
  
  if (status === 'unauthenticated') {
    return <AuthGuard callbackUrl="/bookmark" />
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        title="Danh sách bookmark"
        description="Quản lý truyện đã lưu của bạn"
      />
      
      <FilterTabs 
        tabs={tabs}
        activeTabId={filterType}
        onTabChange={setFilterType}
        className="mb-6"
      />
      
      {filteredBookmarks.length > 0 ? (
        <BookmarkList 
          bookmarks={filteredBookmarks}
          onToggleFavorite={toggleFavorite}
          onRemoveBookmark={removeBookmark}
        />
      ) : (
        <EmptyState
          icon={<BookmarkIcon className="w-12 h-12" />}
          title="Không có bookmark"
          description="Bạn chưa lưu truyện nào vào bookmark"
          actionLink="/comics"
          actionText="Khám phá truyện ngay"
        />
      )}
    </div>
  )
} 