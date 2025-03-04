'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { 
  UserIcon, 
  MagnifyingGlassIcon, 
  BookmarkIcon, 
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
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
  const { data: session, status } = useSession()
  const [showGenres, setShowGenres] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  
  const userMenuButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

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
    if (showMobileMenu) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (!target.closest('#mobile-menu-content') && !target.closest('#menu-toggle')) {
          setShowMobileMenu(false)
        }
      }
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMobileMenu])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showMobileMenu])

  // Handle clicks outside the user menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current && 
        userMenuButtonRef.current && 
        !userMenuRef.current.contains(e.target as Node) && 
        !userMenuButtonRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close the mobile menu and reset genre dropdown when menu is closed
  const closeMobileMenu = () => {
    setShowMobileMenu(false)
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
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle mobile menu"
          >
            {showMobileMenu ? (
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
            
            {/* User account */}
            <div className="relative">
              {status === 'authenticated' ? (
                <button
                  ref={userMenuButtonRef}
                  className="group flex items-center gap-2"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="flex-shrink-0 h-9 w-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all duration-200">
                    {session?.user?.image ? (
                      <Image 
                        src={session.user.image}
                        alt="Avatar"
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                  <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                </button>
              ) : (
                <Link 
                  href="/auth/signin"
                  className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
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
      <div className={`fixed inset-0 z-40 ${showMobileMenu ? 'visible' : 'invisible'}`}>
        {/* Overlay - clicking this will close the menu */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            showMobileMenu ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMobileMenu}
          aria-hidden="true"
        ></div>
        
        {/* Menu Content */}
        <div 
          id="mobile-menu-content"
          className={`absolute top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-gray-900 
            shadow-xl transform transition-transform duration-300 ease-in-out
            ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`}
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

      {/* User account dropdown menu */}
      {showUserMenu && status === 'authenticated' && (
        <div 
          ref={userMenuRef}
          className="absolute top-16 right-4 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                {session?.user?.image ? (
                  <Image 
                    src={session.user.image}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {session?.user?.name || session?.user?.username || 'User'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {session?.user?.email || ''}
                </div>
              </div>
            </div>
          </div>
          
          <div className="py-1">
            <Link 
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowUserMenu(false)}
            >
              Trang cá nhân
            </Link>
            <Link 
              href="/bookmark"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowUserMenu(false)}
            >
              Truyện đánh dấu
            </Link>
            <Link 
              href="/reading-history"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowUserMenu(false)}
            >
              Lịch sử đọc
            </Link>
            <Link 
              href="/notifications"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowUserMenu(false)}
            >
              Thông báo
            </Link>
            <Link 
              href="/profile/settings"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowUserMenu(false)}
            >
              Cài đặt tài khoản
            </Link>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <button
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                signOut({ callbackUrl: '/auth/signin' });
                setShowUserMenu(false);
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </header>
  )
} 