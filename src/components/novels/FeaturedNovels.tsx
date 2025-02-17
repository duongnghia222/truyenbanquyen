'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Novel } from '@/types/novel'
import { formatNumber, generateSlug } from '@/lib/utils'

interface FeaturedNovelsProps {
  novels: Novel[]
}

function NavigationButtons() {
  return (
    <>
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
        onClick={() => {
          const container = document.querySelector('.overflow-x-auto')
          if (container) {
            container.scrollBy({ left: -300, behavior: 'smooth' })
          }
        }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
        onClick={() => {
          const container = document.querySelector('.overflow-x-auto')
          if (container) {
            container.scrollBy({ left: 300, behavior: 'smooth' })
          }
        }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </>
  )
}

export function FeaturedNovels({ novels }: FeaturedNovelsProps) {
  if (!novels || novels.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <div className="flex overflow-x-auto gap-6 pb-4 snap-x">
        {novels.map((novel) => (
          <Link
            key={novel.id}
            href={`/novel/${novel.id}/${generateSlug(novel.title)}`}
            className="min-w-[280px] max-w-[280px] group snap-start"
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
              <Image
                src={novel.coverImage}
                alt={novel.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 280px, 280px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 p-4 text-white">
                <h3 className="font-bold text-lg line-clamp-2">{novel.title}</h3>
                <div className="mt-2 text-sm space-y-1">
                  <p className="text-gray-300">{novel.author}</p>
                  <div className="flex items-center gap-3">
                    <span>⭐ {novel.rating.toFixed(1)}</span>
                    <span>👁 {formatNumber(novel.viewCount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <NavigationButtons />
    </section>
  )
} 