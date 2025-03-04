'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookmarkIcon, QuestionMarkCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

// Import components
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { SearchBar } from './SearchBar'
import { DesktopNav } from './DesktopNav'
import { UserMenu } from './UserMenu'
import { MobileMenu } from './MobileMenu'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close the mobile menu and reset genre dropdown
  const closeMobileMenu = () => {
    setShowMobileMenu(false)
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-800' 
        : 'py-4 bg-white dark:bg-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Mobile Menu */}
          <MobileMenu 
            isOpen={showMobileMenu}
            onToggle={() => setShowMobileMenu(!showMobileMenu)}
            onClose={closeMobileMenu}
          />

          {/* Desktop Navigation */}
          <DesktopNav />

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <SearchBar />
          </div>

          {/* Mobile Search Toggle + Theme Toggle + User Actions */}
          <div className="flex items-center gap-1 sm:gap-2 z-10">
            {/* Mobile Search Button */}
            <button
              className="md:hidden p-2.5 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 
                dark:hover:bg-gray-800 transition-colors duration-200"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Toggle search"
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>
            
            {/* Theme Toggle Button */}
            <ThemeToggle />

            <Link 
              href="/bookmark" 
              className="p-2.5 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 
                dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400
                transition-all duration-200 relative group"
            >
              <BookmarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            
            <Link 
              href="/help" 
              className="hidden sm:block p-2.5 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 
                dark:hover:bg-gray-800 hover:text-purple-500 dark:hover:text-purple-400
                transition-all duration-200"
            >
              <QuestionMarkCircleIcon className="w-6 h-6" />
            </Link>
            
            {/* User Menu */}
            <UserMenu />
          </div>
        </div>

        {/* Mobile Search Bar (shows when toggled) */}
        {mobileSearchOpen && (
          <div className="md:hidden pt-4 pb-2 animate-fade-in">
            <SearchBar isMobile={true} />
          </div>
        )}
      </div>
    </header>
  )
} 