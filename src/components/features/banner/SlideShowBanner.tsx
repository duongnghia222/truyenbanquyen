'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type BannerSlide = {
  id: number
  imageUrl: string
  title: string
  description: string
  link: string
}

const DEMO_SLIDES: BannerSlide[] = [
  {
    id: 1,
    imageUrl: '/images/banners/banner1.jpg',
    title: 'Truyện Mới Nhất',
    description: 'Khám phá những tác phẩm mới nhất trên nền tảng',
    link: '/novels/featured'
  },
  {
    id: 2,
    imageUrl: '/images/banners/banner2.jpg',
    title: 'Đọc Truyện Hot',
    description: 'Những tác phẩm được yêu thích nhất',
    link: '/novels/trending'
  },
  {
    id: 3,
    imageUrl: '/images/banners/banner3.jpg',
    title: 'Truyện Đặc Sắc',
    description: 'Tuyển chọn những tác phẩm chất lượng cao',
    link: '/novels/recommended'
  }
]

export function SlideShowBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = DEMO_SLIDES

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  return (
    <div className="relative w-full h-[300px] lg:h-[350px] rounded-lg overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
              <div className="w-full h-full relative">
                {/* Fallback for demo - in production, use real images */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                {/* Image would be here in production */}
                {/* <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                /> */}
              </div>
              <div className="absolute bottom-0 left-0 p-6 z-20 text-white">
                <h3 className="text-2xl font-bold mb-2">{slide.title}</h3>
                <p className="text-sm mb-4 max-w-md">{slide.description}</p>
                <Link
                  href={slide.link}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md inline-block text-sm font-medium transition"
                >
                  Xem ngay
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      
      <button
        onClick={goToNextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-4' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
} 