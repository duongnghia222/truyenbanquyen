import { Metadata } from 'next'
import { HomeHero } from '@/components/features/home/HomeHero'
import { FeaturedNovels } from '@/components/features/novels/FeaturedNovels'
import { RecentNovelUpdates } from '@/components/features/novels/RecentNovelUpdates'
import { AnnouncementsSidebar } from '@/components/features/announcements/AnnouncementsSidebar'
import { PublishNovelCTA } from '@/components/features/novels/PublishNovelCTA'
import { RecommendedNovels } from '@/components/features/novels/RecommendedNovels'

export const metadata: Metadata = {
  title: 'Truyện Bản Quyền - Đọc truyện online',
  description: 'Nền tảng đọc truyện bản quyền hàng đầu Việt Nam',
}

export default async function HomePage() {
  // In a real app, this would fetch from an API
  const featuredNovels = await getFeaturedNovels()
  const recentUpdates = await getRecentUpdates()
  const announcements = await getAnnouncements()

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* Left Sidebar */}
          <aside>
            <AnnouncementsSidebar announcements={announcements} />
          </aside>

          {/* Main Content */}
          <div className="space-y-12">
            <HomeHero />
            <FeaturedNovels novels={featuredNovels} />
            <PublishNovelCTA />
            <RecommendedNovels />
            <RecentNovelUpdates updates={recentUpdates} />
          </div>
        </div>
      </div>
    </main>
  )
}

// Temporary mock data functions - replace with actual API calls
async function getFeaturedNovels() {
  return [
    {
      id: '1',
      title: 'Võ Luyện Đỉnh Phong',
      coverImage: '/images/novels/vo-luyen-dinh-phong.jpg',
      rating: 7.46,
      viewCount: 50000,
      chapterCount: 1500,
      author: 'Tác giả 1',
      genres: ['Cultivation', 'Action']
    },
  ]
}

async function getRecentUpdates() {
  return [
    {
      id: '2',
      title: 'Đấu Phá Thương Khung',
      coverImage: '/images/novels/vo-luyen-dinh-phong.jpg',
      rating: 8.2,
      viewCount: 45000,
      chapterCount: 1200,
      author: 'Tác giả 2',
      genres: ['Cultivation', 'Action'],
      lastUpdated: new Date().toISOString()
    },
  ]
}

async function getAnnouncements() {
  return [
    {
      id: '1',
      title: 'Thông báo bảo trì hệ thống',
      viewCount: 204,
      date: new Date().toISOString(),
    },
  ]
}
