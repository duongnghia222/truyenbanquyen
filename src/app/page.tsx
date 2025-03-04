import { Metadata } from 'next'
import Link from 'next/link'
import { PublishNovelCTA } from '@/components/features/novels/PublishNovelCTA'
import { NovelCard } from '@/components/features/novels/NovelCard'
import { SlideShowBanner } from '@/components/common/banner/SlideShowBanner'
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
  title: 'TruyenBanQuyen - Đọc Truyện Online',
  description: 'Đọc truyện online, truyện mới, truyện full, truyện convert chất lượng cao.',
}

export const revalidate = 0

async function getLatestNovels(): Promise<NovelType[]> {
  try {
    await ensureDatabaseConnection()
    const novels = await Novel.find({})
      .sort({ createdAt: -1 })
      .limit(12)
      .lean()
    
    return JSON.parse(JSON.stringify(novels))
  } catch (error) {
    console.error('Failed to fetch novels:', error)
    return []
  }
}

export default async function HomePage() {
  const novels = await getLatestNovels()

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section with Banner and CTA */}
      <div className="container mx-auto px-4 pt-6 pb-12">
        <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn">
          <div className="w-full lg:w-2/3 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <SlideShowBanner />
          </div>
          <div className="w-full lg:w-1/3 flex items-center">
            <div className="w-full transform hover:scale-105 transition-transform duration-300">
              <PublishNovelCTA />
            </div>
          </div>
        </div>
      </div>
      
      {/* Latest Novels Section */}
      <section className="container mx-auto px-4 py-12 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white relative inline-block">
              Truyện Mới Cập Nhật
              <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-gradient-to-r from-blue-600 to-purple-600"></span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Khám phá các tác phẩm mới nhất trên nền tảng</p>
          </div>
          <Link 
            href="/novel-list" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors duration-200"
          >
            <span>Xem tất cả</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {novels.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {novels.map((novel, index) => (
              <div key={novel._id} className="transform hover:-translate-y-1 transition-transform duration-300 animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                <NovelCard novel={novel} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="text-lg text-gray-500 dark:text-gray-400">Chưa có truyện nào được đăng tải.</p>
            <Link 
              href="/novels/upload" 
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Đăng truyện ngay
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
