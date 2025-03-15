'use client'

import { useState, useRef, useEffect } from 'react'
import { NovelCard } from './NovelCard'
import { Novel as NovelType } from '@/types/novel'

interface TrendingNovelsProps {
  novels: NovelType[]
}

export function TrendingNovels({ novels }: TrendingNovelsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)

  // Check if we need scroll buttons
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const checkScrollButtons = () => {
      setShowLeftButton(container.scrollLeft > 0)
      setShowRightButton(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      )
    }

    // Initial check
    checkScrollButtons()

    // Check on scroll
    container.addEventListener('scroll', checkScrollButtons)
    window.addEventListener('resize', checkScrollButtons)

    return () => {
      container.removeEventListener('scroll', checkScrollButtons)
      window.removeEventListener('resize', checkScrollButtons)
    }
  }, [novels])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * 0.75
    const targetScrollLeft = 
      direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    })
  }

  return (
    <div className="relative">
      {/* Scroll Buttons */}
      {showLeftButton && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-4
            flex items-center justify-center w-10 h-10 rounded-full 
            bg-white dark:bg-gray-800 shadow-md hover:shadow-lg
            border border-gray-200 dark:border-gray-700
            text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400
            transition-all duration-200"
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}
      
      {showRightButton && (
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4
            flex items-center justify-center w-10 h-10 rounded-full 
            bg-white dark:bg-gray-800 shadow-md hover:shadow-lg
            border border-gray-200 dark:border-gray-700
            text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400
            transition-all duration-200"
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      {/* Gradient Overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 
        bg-gradient-to-r from-white to-transparent dark:from-gray-900 dark:to-transparent
        pointer-events-none"
      />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 
        bg-gradient-to-l from-white to-transparent dark:from-gray-900 dark:to-transparent
        pointer-events-none"
      />

      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        className="flex space-x-5 overflow-x-auto pb-4 pt-2 px-3 -mx-3
          scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700
          scrollbar-track-transparent" 
      >
        {novels.map((novel, index) => (
          <div 
            key={novel._id} 
            className="w-[180px] flex-shrink-0 animate-fadeIn" 
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <NovelCard novel={novel} />
          </div>
        ))}
      </div>
    </div>
  )
} 