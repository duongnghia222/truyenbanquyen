'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface FeaturedItem {
  id: string
  title: string
  description: string
  image: string
  link: string
  badge?: string
}

interface FeaturedCarouselProps {
  items: FeaturedItem[]
  autoplaySpeed?: number
}

export function FeaturedCarousel({ items, autoplaySpeed = 5000 }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const goToSlide = (index: number) => {
    setCurrentIndex((items.length + index) % items.length)
  }

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
  }, [items.length])

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length)
  }

  useEffect(() => {
    // Only start autoplay if we have multiple items
    if (items.length <= 1) return

    // Reset timer when current index changes
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Only set new timer if not paused
    if (!isPaused) {
      timerRef.current = setInterval(goToNext, autoplaySpeed)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [currentIndex, isPaused, items.length, autoplaySpeed, goToNext])

  if (items.length === 0) {
    return null
  }

  return (
    <div 
      className="relative overflow-hidden rounded-xl h-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main carousel */}
      <div className="relative h-full">
        {items.map((item, index) => (
          <div 
            key={item.id}
            className={`
              absolute inset-0 transition-opacity duration-1000
              ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}
            `}
          >
            {/* Image with gradient overlay */}
            <div className="relative h-full w-full">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            </div>
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center p-6 md:p-12">
              <div className="max-w-xl text-white">
                {item.badge && (
                  <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold bg-blue-600 rounded-full">
                    {item.badge}
                  </span>
                )}
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 drop-shadow-md">
                  {item.title}
                </h2>
                <p className="mb-6 text-sm md:text-base text-gray-200 line-clamp-3 drop-shadow-md">
                  {item.description}
                </p>
                <Link 
                  href={item.link}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <span>Đọc ngay</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation arrows */}
        {items.length > 1 && (
          <>
            <button 
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 
                flex items-center justify-center w-10 h-10 rounded-full 
                bg-black/30 hover:bg-black/50 text-white
                transition-all duration-200 hover:scale-110"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            <button 
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 
                flex items-center justify-center w-10 h-10 rounded-full 
                bg-black/30 hover:bg-black/50 text-white
                transition-all duration-200 hover:scale-110"
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>
      
      {/* Dots navigation */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${index === currentIndex 
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/80'}
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Autoplay progress indicator */}
      {items.length > 1 && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 z-10 h-1 bg-gray-800/20">
          <div 
            className="h-full bg-blue-600 transition-all ease-linear"
            style={{ 
              width: `${((currentIndex % items.length) / items.length) * 100}%`,
              transitionDuration: `${autoplaySpeed}ms`,
              transform: `scaleX(${isPaused ? 0 : 1})`,
            }}
          />
        </div>
      )}
    </div>
  )
} 