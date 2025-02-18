import Link from 'next/link'

export function PublishNovelCTA() {
  return (
    <section className="text-center py-8">
      <Link
        href="/novels/upload"
        className="inline-flex items-center gap-2 px-8 py-4 text-lg font-medium text-white 
          bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600
          rounded-lg shadow-lg hover:shadow-xl shadow-blue-500/20 hover:shadow-purple-500/20
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
          focus:ring-offset-2 dark:focus:ring-offset-gray-900 
          transition-all duration-300"
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
      <p className="mt-4 text-sm text-gray-900 dark:text-gray-200">
        Chia sẻ tác phẩm của bạn với cộng đồng đọc giả
      </p>
    </section>
  )
} 