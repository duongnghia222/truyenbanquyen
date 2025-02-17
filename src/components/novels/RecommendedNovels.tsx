import Image from 'next/image'
import Link from 'next/link'
import { Novel } from '@/types/novel'
import { formatNumber, generateSlug } from '@/lib/utils'

export function RecommendedNovels() {
  // This would normally fetch from an API
  const recommendedNovels: Novel[] = [
    {
      id: '1',
      title: 'Võ Luyện Đỉnh Phong',
      coverImage: '/images/novels/vo-luyen-dinh-phong.jpg',
      rating: 7.46,
      viewCount: 50000,
      chapterCount: 1500,
      author: 'Tác giả 1',
      genres: ['Cultivation', 'Action'],
    },
    // Add more recommended novels...
  ]

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">BTY Đề Cử</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recommendedNovels.map((novel) => (
          <Link
            key={novel.id}
            href={`/novel/${novel.id}/${generateSlug(novel.title)}`}
            className="group"
          >
            <article>
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                <Image
                  src={novel.coverImage}
                  alt={novel.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                  <div className="flex items-center justify-between text-sm">
                    <span>⭐ {novel.rating.toFixed(1)}</span>
                    <span>👁 {formatNumber(novel.viewCount)}</span>
                  </div>
                </div>
              </div>
              <h3 className="mt-2 font-medium line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {novel.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {novel.author}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
} 