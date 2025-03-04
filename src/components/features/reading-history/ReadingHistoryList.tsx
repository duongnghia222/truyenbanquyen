'use client'

import { ReadingHistoryItem } from './ReadingHistoryData'
import { ReadingHistoryCard } from './ReadingHistoryCard'
import { EmptyReadingHistory } from './EmptyReadingHistory'

interface ReadingHistoryListProps {
  items: ReadingHistoryItem[]
  onUpdateStatus: (id: number, newStatus: string) => void
}

export function ReadingHistoryList({ items, onUpdateStatus }: ReadingHistoryListProps) {
  if (items.length === 0) {
    return <EmptyReadingHistory />
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {items.map((item) => (
        <ReadingHistoryCard
          key={item.id}
          item={item}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  )
} 