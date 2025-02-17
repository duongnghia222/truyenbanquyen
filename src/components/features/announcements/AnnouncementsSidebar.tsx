import { Announcement } from '@/types/novel'
import { formatNumber } from '@/lib/utils'

interface AnnouncementsSidebarProps {
  announcements: Announcement[]
}

export function AnnouncementsSidebar({ announcements }: AnnouncementsSidebarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">Thông Báo</h2>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0"
          >
            <a
              href={`/announcements/${announcement.id}`}
              className="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <h3 className="font-medium line-clamp-2">{announcement.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span>{new Date(announcement.date).toLocaleDateString('vi-VN')}</span>
                <span>•</span>
                <span>{formatNumber(announcement.viewCount)} lượt xem</span>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
} 