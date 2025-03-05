'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/components/providers/ThemeProvider'
import {
  BookOpenIcon,
  HeartIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

const footerLinks = [
  {
    title: 'Truyện Light',
    links: [
      { name: 'Giới thiệu', href: '/gioi-thieu', icon: <InformationCircleIcon className="w-4 h-4" /> },
      { name: 'Điều khoản sử dụng', href: '/dieu-khoan', icon: <DocumentTextIcon className="w-4 h-4" /> },
      { name: 'Chính sách bảo mật', href: '/chinh-sach', icon: <ShieldCheckIcon className="w-4 h-4" /> },
    ]
  },
  {
    title: 'Khám phá',
    links: [
      { name: 'Thể loại', href: '/the-loai', icon: <BookOpenIcon className="w-4 h-4" /> },
      { name: 'Bảng xếp hạng', href: '/bang-xep-hang', icon: <HeartIcon className="w-4 h-4" /> },
      { name: 'Tác giả', href: '/tac-gia', icon: <UserGroupIcon className="w-4 h-4" /> },
    ]
  }
]

export default function Footer() {
  const { theme } = useTheme()
  
  return (
    <footer className={`${theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'} mt-10`}>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div>
            <Link 
              href="/" 
              className="group relative z-10 flex items-center"
            >
              <Image
                src="/images/Logo_web.png"
                alt="TruyenLight Logo"
                width={180}
                height={40}
                className="transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>
            <p className="mt-4 text-sm">
              Nền tảng đọc truyện chữ bản quyền hàng đầu Việt Nam, mang đến cho bạn những tác phẩm chất lượng và hợp pháp.
            </p>
          </div>
          
          {/* Quick links */}
          {footerLinks.map((column, columnIndex) => (
            <div key={columnIndex}>
              <h3 className="text-lg font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="inline-flex items-center text-sm hover:underline">
                      {link.icon && <span className="mr-2">{link.icon}</span>}
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom section */}
        <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm">
              © {new Date().getFullYear()} Truyện Light. Tất cả các quyền được bảo lưu.
            </p>
            <div className="mt-4 sm:mt-0 flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                Facebook
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                Twitter
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 