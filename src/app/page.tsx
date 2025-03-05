import { Metadata } from 'next'
import Link from 'next/link'
import { PublishNovelCTA } from '@/components/features/novels/PublishNovelCTA'
import { NovelCard } from '@/components/features/novels/NovelCard'
import { SectionHeader } from '@/components/common/layout/SectionHeader'
import { GenreBrowser } from '@/components/features/genres/GenreBrowser'
import { TrendingNovels } from '@/components/features/novels/TrendingNovels'
import { ReadingStats } from '@/components/features/reading-history/ReadingStats'
import { FeaturedAuthors } from '@/components/features/profile/FeaturedAuthors'
import { FeaturedCarousel } from '@/components/common/carousel/FeaturedCarousel'
import { LoginCTA } from '@/components/features/auth/LoginCTA'
import { ensureDatabaseConnection } from '@/lib/db'
import Novel from '@/models/Novel'
import ClientAuthWrapper from '@/components/features/auth/ClientAuthWrapper'

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
  title: 'TruyenLight - Đọc Truyện Online',
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

// Mock function to get trending novels (would be replaced with real API call)
async function getTrendingNovels(): Promise<NovelType[]> {
  try {
    await ensureDatabaseConnection()
    const novels = await Novel.find({})
      .sort({ views: -1 })
      .limit(12)
      .lean()
    
    return JSON.parse(JSON.stringify(novels))
  } catch (error) {
    console.error('Failed to fetch trending novels:', error)
    return []
  }
}

// Mock featured novels for carousel (would be replaced with real data)
const FEATURED_NOVELS = [
  {
    id: '1',
    title: 'Đắc Nhân Tâm',
    description: 'Cuốn sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất mọi thời đại. Đắc Nhân Tâm là cuốn sách đầu tiên viết về các mối quan hệ của con người và đã trở thành một hiện tượng trong nền văn hoá đại chúng.',
    image: 'https://source.unsplash.com/random/1200x600?book-1',
    link: '/novels/1',
    badge: 'Đặc sắc'
  },
  {
    id: '2',
    title: 'Nhà Giả Kim',
    description: 'Tiểu thuyết "Nhà giả kim" của Paulo Coelho như một câu chuyện cổ tích giản dị, nhưng lại đầy ý nghĩa. Đây là câu chuyện của Santiago, một cậu bé chăn cừu người Tây Ban Nha.',
    image: 'https://source.unsplash.com/random/1200x600?book-2',
    link: '/novels/2',
    badge: 'Bán chạy'
  },
  {
    id: '3',
    title: 'Rừng Na Uy',
    description: 'Câu chuyện tình yêu và nỗi cô đơn của Toru Watanabe, một sinh viên sống ở Tokyo. Cậu phải lòng Naoko, bạn gái của người bạn thân đã tự tử.',
    image: 'https://source.unsplash.com/random/1200x600?book-3',
    link: '/novels/3',
    badge: 'Đề cử'
  }
]

export default async function HomePage() {
  const novels = await getLatestNovels()
  const trendingNovels = await getTrendingNovels()

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section with Featured Carousel */}
      <div className="container mx-auto px-4 pt-6 pb-12">
        <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn">
          <div className="w-full lg:w-2/3 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 h-[400px]">
            <FeaturedCarousel items={FEATURED_NOVELS} />
          </div>
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <div className="flex-1 transform hover:scale-105 transition-transform duration-300">
              <PublishNovelCTA />
            </div>
            <div className="flex-1">
              {/* Reading stats requires authentication */}
              <ClientAuthWrapper
                authenticatedComponent={<ReadingStats compact={true} />}
                unauthenticatedComponent={
                  <LoginCTA 
                    title="Theo dõi tiến độ đọc truyện"
                    description="Đăng nhập để lưu lịch sử đọc và xem thống kê cá nhân"
                  />
                }
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Browse by Genre Section - Available to all users */}
      <section className="container mx-auto px-4 py-12 border-t border-gray-100 dark:border-gray-800">
        <SectionHeader 
          title="Thể Loại Phổ Biến"
          description="Khám phá truyện theo thể loại yêu thích của bạn"
          viewAllLink="/genres"
        />
        
        <GenreBrowser limit={8} />
      </section>
      
      {/* Trending Novels Section - Available to all users */}
      <section className="container mx-auto px-4 py-12 border-t border-gray-100 dark:border-gray-800">
        <SectionHeader 
          title="Đang Thịnh Hành"
          description="Những truyện được đọc nhiều nhất hiện nay"
          viewAllLink="/trending"
        />
        
        {trendingNovels.length > 0 ? (
          <TrendingNovels novels={trendingNovels} />
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="text-lg text-gray-500 dark:text-gray-400">Chưa có dữ liệu truyện thịnh hành.</p>
          </div>
        )}
      </section>
      
      {/* Latest Novels Section - Available to all users */}
      <section className="container mx-auto px-4 py-12 border-t border-gray-100 dark:border-gray-800">
        <SectionHeader 
          title="Truyện Mới Cập Nhật"
          description="Khám phá các tác phẩm mới nhất trên nền tảng"
          viewAllLink="/novel-list"
        />

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
      
      {/* Featured Authors Section - Available to all users */}
      <section className="container mx-auto px-4 py-12 border-t border-gray-100 dark:border-gray-800">
        <SectionHeader 
          title="Tác Giả Nổi Bật"
          description="Những cây bút được yêu thích nhất"
          viewAllLink="/authors"
        />
        
        <FeaturedAuthors />
      </section>
    </main>
  )
}
