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
  MoonIcon
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
  const { theme, toggleTheme } = useTheme()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            className="group relative"
          >
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
              transition-all duration-300 group-hover:from-purple-600 group-hover:to-blue-600"
            >
              TruyenBanQuyen
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600
              transition-all duration-300 group-hover:w-full"></span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 ml-12">
            <Link 
              href="/danh-sach" 
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

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
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

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 
                dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400
                transition-all duration-200"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-6 h-6" />
              ) : (
                <MoonIcon className="w-6 h-6" />
              )}
            </button>

            <Link 
              href="/bookmark" 
              className="p-2.5 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 
                dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400
                transition-all duration-200 relative group"
            >
              <BookmarkIcon className="w-6 h-6" />
            </Link>
            
            <Link 
              href="/help" 
              className="p-2.5 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 
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
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl
                  shadow-xl border border-gray-200 dark:border-gray-700 py-2 opacity-0 invisible
                  group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {session.user?.name || 'User'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {session.user?.email}
                    </div>
                  </div>
                  <Link 
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200
                      hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <span>Trang cá nhân</span>
                  </Link>
                  <Link 
                    href="/profile/settings" 
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200
                      hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <span>Cài đặt</span>
                  </Link>
                  <button 
                    onClick={() => signOut({
                      callbackUrl: '/signin',
                      redirect: true
                    })}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-500
                      hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/signin"
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600
                  text-white font-medium hover:from-purple-600 hover:to-blue-600
                  transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-purple-500/20"
              >
                Đăng Nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 