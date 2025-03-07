import Image from 'next/image'
import Link from 'next/link'
import { Novel } from '@/types/novel'
import { formatNumber, generateSlug, formatDate } from '@/lib/utils'

interface RecentNovelUpdatesProps {
  updates: Novel[]
}

export function RecentNovelUpdates({ updates }: RecentNovelUpdatesProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Mới Cập Nhật</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {updates.map((novel) => (
          <Link
            key={novel.id}
            href={`/novel/${novel.id}/${generateSlug(novel.title)}`}
            className="group"
          >
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex gap-4 p-4">
                <div className="relative w-20 h-28 flex-shrink-0">
                  <Image
                    src={novel.coverImage}
                    alt={novel.title}
                    fill
                    className="object-cover rounded"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {novel.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {novel.author}
                  </p>
                  {novel.uploaderUsername && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Đăng bởi: {novel.uploaderUsername}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <span>⭐ {novel.rating.toFixed(1)}</span>
                    <span>👁 {formatNumber(novel.viewCount)}</span>
                  </div>
                  {novel.lastUpdated && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Cập nhật: {formatDate(novel.lastUpdated)}
                    </p>
                  )}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
} 