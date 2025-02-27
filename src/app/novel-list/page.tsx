import { Metadata } from 'next'
import Link from 'next/link'
import { NovelCard } from '@/components/features/novels/NovelCard'
import { ensureDatabaseConnection } from '@/lib/db'
import Novel from '@/models/Novel'

interface NovelType {
  _id: string
  title: string
  author: string
  description: string
  coverImage: string
  genres: string[]
  status: 'ongoing' | 'completed' | 'hiatus'
  rating: number
  views: number
  createdAt: string
  updatedAt: string
}

export const metadata: Metadata = {
  title: 'Danh Sách Truyện - TruyenBanQuyen',
  description: 'Khám phá danh sách truyện đa dạng với nhiều thể loại khác nhau.',
}

export const revalidate = 0

async function getNovels(): Promise<NovelType[]> {
  try {
    await ensureDatabaseConnection()
    const novels = await Novel.find({})
      .sort({ createdAt: -1 })
      .lean()
    
    return JSON.parse(JSON.stringify(novels))
  } catch (error) {
    console.error('Failed to fetch novels:', error)
    return []
  }
}

export default async function NovelListPage() {
  const novels = await getNovels()
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Danh Sách Truyện</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Khám phá kho tàng truyện đa dạng với nhiều thể loại và tác giả khác nhau. Từ truyện mới cập nhật đến những tác phẩm kinh điển.
        </p>
      </div>
      
      {/* Filter Section */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <div className="w-full md:w-auto">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trạng thái
            </label>
            <select
              id="status"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              defaultValue=""
            >
              <option value="">Tất cả</option>
              <option value="ongoing">Đang ra</option>
              <option value="completed">Hoàn thành</option>
              <option value="hiatus">Tạm ngưng</option>
            </select>
          </div>
          
          <div className="w-full md:w-auto">
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sắp xếp
            </label>
            <select
              id="sort"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              defaultValue="newest"
            >
              <option value="newest">Mới nhất</option>
              <option value="popular">Phổ biến</option>
              <option value="rating">Đánh giá cao</option>
            </select>
          </div>
          
          <div className="w-full md:w-auto">
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thể loại
            </label>
            <select
              id="genre"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              defaultValue=""
            >
              <option value="">Tất cả</option>
              <option value="action">Hành động</option>
              <option value="romance">Tình cảm</option>
              <option value="fantasy">Kỳ ảo</option>
              <option value="mystery">Bí ẩn</option>
              <option value="horror">Kinh dị</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Novels Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {novels.map((novel) => (
          <NovelCard key={novel._id} novel={novel} />
        ))}
      </div>
      
      {novels.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Không tìm thấy truyện nào
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Chưa có truyện nào được đăng tải hoặc phù hợp với bộ lọc bạn đã chọn.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Quay lại trang chủ
          </Link>
        </div>
      )}
      
      {/* Pagination */}
      {novels.length > 0 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-1">
            <button
              className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              aria-label="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium">1</button>
            <button className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600">2</button>
            <button className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600">3</button>
            <span className="px-4 py-2">...</span>
            <button className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600">10</button>
            <button
              className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              aria-label="Next page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </main>
  )
} 