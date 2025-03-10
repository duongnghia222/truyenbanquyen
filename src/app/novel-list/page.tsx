import { Metadata } from 'next'
import Link from 'next/link'
import { NovelCard } from '@/components/features/novels/NovelCard'
import { ensureDatabaseConnection } from '@/lib/db'
import Novel from '@/models/Novel'

interface NovelType {
  _id: string
  title: string
  slug: string
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
  title: 'Danh Sách Truyện - TruyenLight',
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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Header Section */}
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <svg className="w-64 h-64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" 
                strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in">
              Danh Sách Truyện
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg animate-fade-in animation-delay-100">
              Khám phá kho tàng truyện đa dạng với nhiều thể loại và tác giả khác nhau. Từ truyện mới cập nhật đến những tác phẩm kinh điển.
            </p>
          </div>
        </div>
        
        {/* Filter Section */}
        <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in animation-delay-200">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Lọc & Tìm Kiếm</h2>
          <div className="flex flex-wrap gap-6">
            <div className="w-full md:w-auto flex-1">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trạng thái
              </label>
              <select
                id="status"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                defaultValue=""
              >
                <option value="">Tất cả</option>
                <option value="ongoing">Đang ra</option>
                <option value="completed">Hoàn thành</option>
                <option value="hiatus">Tạm ngưng</option>
              </select>
            </div>
            
            <div className="w-full md:w-auto flex-1">
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sắp xếp
              </label>
              <select
                id="sort"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                defaultValue="newest"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="rating">Đánh giá cao</option>
              </select>
            </div>
            
            <div className="w-full md:w-auto flex-1">
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thể loại
              </label>
              <select
                id="genre"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
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
            
            <div className="w-full md:w-auto self-end">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between animate-fade-in animation-delay-300">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">{novels.length}</span> truyện được tìm thấy
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Hiển thị:</span>
            <select className="bg-transparent border border-gray-300 dark:border-gray-700 rounded-md text-sm">
              <option>12</option>
              <option>24</option>
              <option>48</option>
            </select>
          </div>
        </div>
        
        {/* Novels Grid */}
        {novels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 animate-fade-in animation-delay-400">
            {novels.map((novel, index) => (
              <div key={novel._id} className="animate-fade-in" style={{animationDelay: `${(index * 50) + 400}ms`}}>
                <NovelCard novel={novel} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md animate-fade-in animation-delay-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Không tìm thấy truyện nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Chưa có truyện nào được đăng tải hoặc phù hợp với bộ lọc bạn đã chọn.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-5 py-2.5 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              Quay lại trang chủ
            </Link>
          </div>
        )}
        
        {/* Pagination */}
        {novels.length > 0 && (
          <div className="mt-12 flex justify-center animate-fade-in animation-delay-500">
            <nav className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1.5 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
              <button
                className="p-2 rounded-md text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Previous page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="min-w-[40px] h-10 rounded-md bg-blue-600 text-white font-medium transition-colors duration-200">1</button>
              <button className="min-w-[40px] h-10 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">2</button>
              <button className="min-w-[40px] h-10 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">3</button>
              <span className="min-w-[40px] h-10 flex items-center justify-center">...</span>
              <button className="min-w-[40px] h-10 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">10</button>
              <button
                className="p-2 rounded-md text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Next page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </main>
  )
} 