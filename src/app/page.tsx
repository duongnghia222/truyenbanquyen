import { Metadata } from 'next'
import { PublishNovelCTA } from '@/components/features/novels/PublishNovelCTA'
import { NovelCard } from '@/components/novels/NovelCard'
import connectDB from '@/lib/mongodb'
import Novel from '@/models/Novel'

interface NovelType {
  _id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  genres: string[];
  status: string;
  rating: number;
  views: number;
}

export const metadata: Metadata = {
  title: 'Truyện Bản Quyền - Đọc truyện online',
  description: 'Nền tảng đọc truyện bản quyền hàng đầu Việt Nam',
}

export const revalidate = 0

async function getLatestNovels(): Promise<NovelType[]> {
  await connectDB()
  const novels = await Novel.find({})
    .sort({ createdAt: -1 })
    .limit(12)
    .lean()
  
  return JSON.parse(JSON.stringify(novels))
}

export default async function HomePage() {
  const novels = await getLatestNovels()

  return (
    <main className="container mx-auto px-4 py-8">
      <PublishNovelCTA />
      
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Truyện Mới Cập Nhật</h2>
          <a href="/novels" className="text-blue-600 hover:text-blue-700">
            Xem tất cả
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {novels.map((novel: NovelType) => (
            <NovelCard key={novel._id} novel={novel} />
          ))}
        </div>

        {novels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có truyện nào được đăng tải.</p>
          </div>
        )}
      </section>
    </main>
  )
}
