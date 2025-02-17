import Link from 'next/link'

export function PublishNovelCTA() {
  return (
    <section className="text-center py-8">
      <Link
        href="/publish"
        className="inline-flex items-center gap-2 px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-lg hover:shadow-xl"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Đăng Truyện
      </Link>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Chia sẻ tác phẩm của bạn với cộng đồng đọc giả
      </p>
    </section>
  )
} 