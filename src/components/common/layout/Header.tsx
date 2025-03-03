'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  UserIcon, 
  MagnifyingGlassIcon, 
  BookmarkIcon, 
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon,
  BookOpenIcon,  
  ArrowRightOnRectangleIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/components/providers/ThemeProvider'

const genres = [
  [
    { name: 'Bách Hợp', slug: 'bach-hop', icon: '♀' },
    { name: 'Dị Giới', slug: 'di-gioi' },
    { name: 'Hài Hước', slug: 'hai-huoc' },
    { name: 'Khoa Huyễn', slug: 'khoa-huyen', icon: '🔬' },
    { name: 'Linh Dị', slug: 'linh-di' },
    { name: 'Ngược', slug: 'nguoc' },
    { name: 'Phương Tây', slug: 'phuong-tay' },
    { name: 'Sủng', slug: 'sung', icon: '❤' },
    { name: 'Truyện Teen', slug: 'truyen-teen', icon: '👶' },
    { name: 'Tổng Tài', slug: 'tong-tai' },
    { name: 'Xuyên Không', slug: 'xuyen-khong', icon: '↩' },
    { name: 'Điền Văn', slug: 'dien-van' }
  ],
  [
    { name: 'Cận Đại', slug: 'can-dai' },
    { name: 'Dị Năng', slug: 'di-nang' },
    { name: 'Hắc Bang', slug: 'hac-bang' },
    { name: 'Kiếm Hiệp', slug: 'kiem-hiep' },
    { name: 'Mạt Thế', slug: 'mat-the' },
    { name: 'Nữ Cường', slug: 'nu-cuong' },
    { name: 'Quân Nhân', slug: 'quan-nhan' },
    { name: 'Tiên Hiệp', slug: 'tien-hiep' },
    { name: 'Trọng Sinh', slug: 'trong-sinh' },
    { name: 'Võng Du', slug: 'vong-du', icon: '🎮' },
    { name: 'Xuyên Nhanh', slug: 'xuyen-nhanh' },
    { name: 'Đô Thị', slug: 'do-thi' }
  ],
  [
    { name: 'Cổ Đại', slug: 'co-dai' },
    { name: 'Huyền Huyễn', slug: 'huyen-huyen', icon: '✨' },
    { name: 'Hệ Thống', slug: 'he-thong', icon: '⚙' },
    { name: 'Kỳ Huyễn', slug: 'ky-huyen' },
    { name: 'Ngôn Tình', slug: 'ngon-tinh', icon: '💕' },
    { name: 'Nữ Phụ', slug: 'nu-phu' },
    { name: 'Showbiz', slug: 'showbiz' },
    { name: 'Trinh Thám', slug: 'trinh-tham' },
    { name: 'Tương Lai', slug: 'tuong-lai' },
    { name: 'Vườn Trường', slug: 'vuon-truong' },
    { name: 'Đam Mỹ', slug: 'dam-my', icon: '🌹' },
    { name: 'Đồng Nhân', slug: 'dong-nhan', icon: '©' }
  ]
]

export default function Header() {
  const { data: session } = useSession()
  const [showGenres, setShowGenres] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (mobileMenuOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (!target.closest('#mobile-menu-content') && !target.closest('#menu-toggle')) {
          setMobileMenuOpen(false)
        }
      }
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [mobileMenuOpen])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [mobileMenuOpen])

  // Close the mobile menu and reset genre dropdown when menu is closed
  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setShowGenres(false)
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
          <Link 
            href="/" 
            className="group relative z-10 flex items-center"
          >
            <Image
              src="/images/Logo_web.png"
              alt="TruyenBanQuyen Logo"
              width={180}
              height={40}
              className="transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>

          {/* Mobile menu button */}
          <button 
            id="menu-toggle"
            className="md:hidden p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 
              dark:hover:bg-gray-800 rounded-lg transition-colors z-10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 ml-12">
            <Link 
              href="/novel-list" 
              className="relative group py-2"
            >
              <span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white
                transition-colors duration-200">
                Danh Sách
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600
                transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <div className="relative group">
              <button
                onClick={() => setShowGenres(!showGenres)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-200 group-hover:text-gray-900 
                  dark:group-hover:text-white transition-colors duration-200 py-2"
              >
                <span>Thể Loại</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${
                  showGenres ? 'rotate-180' : ''
                }`} />
              </button>
              
              {showGenres && (
                <div className="absolute top-full left-0 mt-2 w-[800px] bg-white dark:bg-gray-800 
                  rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 grid grid-cols-3 gap-8
                  animate-fade-in-down origin-top">
                  {genres.map((column, columnIndex) => (
                    <div key={columnIndex} className="space-y-3">
                      {column.map((genre) => (
                        <Link
                          key={genre.slug}
                          href={`/the-loai/${genre.slug}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300
                            hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200
                            hover:text-gray-900 dark:hover:text-white"
                        >
                          {genre.icon && (
                            <span className="text-lg">{genre.icon}</span>
                          )}
                          <span>{genre.name}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập Tên Truyện..."
                className="w-full px-5 py-2.5 rounded-full bg-gray-50 dark:bg-gray-800 
                  border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-400
                  focus:outline-none transition-all duration-200 text-gray-900 dark:text-white
                  placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full
                text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 
                transition-colors duration-200">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl
                  shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-fade-in-down">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Đang tìm kiếm: {searchQuery}...
                  </div>
                </div>
              )}
            </div>
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
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 
                dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400
                transition-all duration-200"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>

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
            
            {session ? (
              <div className="relative group">
                <button 
                  className="flex items-center gap-2 p-1.5 rounded-full text-gray-700 dark:text-gray-200 
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'Profile'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </button>
                
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl
                  shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden opacity-0 invisible
                  group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  
                  {/* Profile header with gradient background */}
                  <div className="relative">
                    <div className="h-20 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                    <div className="absolute left-0 -bottom-12 w-full px-4 flex">
                      <div className="relative">
                        {session.user?.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || 'Profile'}
                            width={60}
                            height={60}
                            className="rounded-full border-4 border-white dark:border-gray-800"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center
                            border-4 border-white dark:border-gray-800">
                            <UserIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* User info */}
                  <div className="pt-14 pb-3 px-4">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      {session.user?.name || 'Người dùng'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {session.user?.email}
                    </div>
                  </div>
                  
                  {/* User stats */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/70 grid grid-cols-3 gap-1 text-center">
                    <div className="px-2 py-1.5">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">0</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Đang đọc</div>
                    </div>
                    <div className="px-2 py-1.5">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">0</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Đã đọc</div>
                    </div>
                    <div className="px-2 py-1.5">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">0</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Yêu thích</div>
                    </div>
                  </div>
                  
                  {/* Quick actions */}
                  <div className="py-2">
                    <Link 
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200
                        hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <UserIcon className="w-5 h-5" />
                      <span>Trang cá nhân</span>
                    </Link>
                    <Link 
                      href="/bookmark" 
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200
                        hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <BookmarkIcon className="w-5 h-5" />
                      <span>Truyện đánh dấu</span>
                    </Link>
                    <Link 
                      href="/reading-history" 
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200
                        hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <BookOpenIcon className="w-5 h-5" />
                      <span>Lịch sử đọc</span>
                    </Link>
                    <Link 
                      href="/notifications" 
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200
                        hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <BellIcon className="w-5 h-5" />
                      <span>Thông báo</span>
                    </Link>
                    <Link 
                      href="/profile/settings" 
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200
                        hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <Cog6ToothIcon className="w-5 h-5" />
                      <span>Cài đặt tài khoản</span>
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={() => signOut({
                        callbackUrl: '/signin',
                        redirect: true
                      })}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500
                        hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/signin"
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600
                  text-white text-sm sm:text-base font-medium hover:from-purple-600 hover:to-blue-600
                  transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-purple-500/20"
              >
                Đăng Nhập
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar (shows when toggled) */}
        {mobileSearchOpen && (
          <div className="md:hidden pt-4 pb-2 animate-fade-in">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập Tên Truyện..."
                className="w-full px-5 py-2.5 rounded-full bg-gray-50 dark:bg-gray-800 
                  border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-400
                  focus:outline-none transition-all duration-200 text-gray-900 dark:text-white
                  placeholder:text-gray-500 dark:placeholder:text-gray-400"
                autoFocus
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full
                text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 
                transition-colors duration-200">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
            {searchQuery && (
              <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl
                shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-fade-in-down">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Đang tìm kiếm: {searchQuery}...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 ${mobileMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Overlay - clicking this will close the menu */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMobileMenu}
          aria-hidden="true"
        ></div>
        
        {/* Menu Content */}
        <div 
          id="mobile-menu-content"
          className={`absolute top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-gray-900 
            shadow-xl transform transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800
              text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700
              transition-colors duration-200 z-50"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          <div className="pt-16 px-6 pb-8 h-full overflow-y-auto">
            <nav className="flex flex-col gap-4">
              <Link 
                href="/novel-list" 
                className="text-lg font-medium text-gray-900 dark:text-white py-3 border-b border-gray-100 dark:border-gray-800
                  flex items-center justify-between"
                onClick={closeMobileMenu}
              >
                <span>Danh Sách</span>
              </Link>
              
              <div className="py-3 border-b border-gray-100 dark:border-gray-800">
                <div 
                  className="text-lg font-medium text-gray-900 dark:text-white 
                    flex items-center justify-between cursor-pointer"
                  onClick={() => setShowGenres(!showGenres)}
                >
                  <span>Thể Loại</span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${
                    showGenres ? 'rotate-180' : ''
                  }`} />
                </div>
                
                {showGenres && (
                  <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-2">
                    {genres.flat().map((genre) => (
                      <Link
                        key={genre.slug}
                        href={`/the-loai/${genre.slug}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300
                          hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        onClick={closeMobileMenu}
                      >
                        {genre.icon && (
                          <span className="text-lg">{genre.icon}</span>
                        )}
                        <span>{genre.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <Link 
                href="/help" 
                className="text-lg font-medium text-gray-900 dark:text-white py-3 border-b border-gray-100 dark:border-gray-800
                  flex items-center gap-3"
                onClick={closeMobileMenu}
              >
                <QuestionMarkCircleIcon className="w-6 h-6" />
                <span>Trợ Giúp</span>
              </Link>

              {!session && (
                <div className="mt-6">
                  <Link
                    href="/signin"
                    className="w-full flex justify-center py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600
                      text-white font-medium hover:from-purple-600 hover:to-blue-600
                      transition-all duration-300 shadow-lg"
                    onClick={closeMobileMenu}
                  >
                    Đăng Nhập
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
} 