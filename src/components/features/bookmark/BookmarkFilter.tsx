'use client'

interface BookmarkFilterProps {
  filterType: string
  onFilterChange: (filterType: string) => void
}

export function BookmarkFilter({ filterType, onFilterChange }: BookmarkFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Truyện Đánh Dấu
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Danh sách truyện bạn đã lưu
        </p>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-4 py-2 rounded-lg ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => onFilterChange('favorite')}
          className={`px-4 py-2 rounded-lg ${
            filterType === 'favorite'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Yêu thích
        </button>
      </div>
    </div>
  )
} 