'use client'

import { BookmarkCard, BookmarkItem } from './BookmarkCard'
import { EmptyBookmark } from './EmptyBookmark'

interface BookmarkListProps {
  bookmarks: BookmarkItem[]
  onToggleFavorite: (id: number) => void
  onRemoveBookmark: (id: number) => void
}

export function BookmarkList({ bookmarks, onToggleFavorite, onRemoveBookmark }: BookmarkListProps) {
  if (bookmarks.length === 0) {
    return <EmptyBookmark />
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {bookmarks.map((book) => (
        <BookmarkCard 
          key={book.id} 
          book={book} 
          onToggleFavorite={onToggleFavorite}
          onRemoveBookmark={onRemoveBookmark}
        />
      ))}
    </div>
  )
} 