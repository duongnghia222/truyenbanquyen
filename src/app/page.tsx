import { Metadata } from 'next'
import Link from 'next/link'
import { PublishNovelCTA } from '@/components/features/novels/PublishNovelCTA'
import { NovelCard } from '@/components/features/novels/NovelCard'
import { SlideShowBanner } from '@/components/features/banner/SlideShowBanner'
import connectDB from '@/lib/mongodb'
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
    await connectDB()
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
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3">
          <SlideShowBanner />
        </div>
        <div className="w-full lg:w-1/3">
          <PublishNovelCTA />
        </div>
      </div>
      
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Truyện Mới Cập Nhật</h2>
          <Link 
            href="/novels" 
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {novels.map((novel) => (
            <NovelCard key={novel._id} novel={novel} />
          ))}
        </div>

        {novels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Chưa có truyện nào được đăng tải.</p>
          </div>
        )}
      </section>
    </main>
  )
}
