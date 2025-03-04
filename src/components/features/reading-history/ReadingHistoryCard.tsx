'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { ReadingHistoryItem } from './ReadingHistoryData'
import { StatusDropdown, StatusOption } from '@/components/common'

interface ReadingHistoryCardProps {
  item: ReadingHistoryItem
  onUpdateStatus: (id: number, newStatus: string) => void
}

export function ReadingHistoryCard({ item, onUpdateStatus }: ReadingHistoryCardProps) {
  // Define status options
  const statusOptions: StatusOption[] = [
    { 
      id: 'reading', 
      label: 'Đang đọc', 
      color: 'bg-blue-100', 
      textColor: 'text-blue-800' 
    },
    { 
      id: 'completed', 
      label: 'Đã hoàn thành', 
      color: 'bg-green-100', 
      textColor: 'text-green-800' 
    },
    { 
      id: 'on_hold', 
      label: 'Tạm dừng', 
      color: 'bg-yellow-100', 
      textColor: 'text-yellow-800' 
    }
  ]

  return (
    <div 
      className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg
        border border-gray-200 dark:border-gray-700 transition-all duration-200
        hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900"
    >
      {/* Novel cover */}
      <div className="sm:w-1/6 flex-shrink-0">
        <Link href={`/novels/${item.slug}`}>
          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-md">
            <Image
              src={item.cover}
              alt={item.title}
              fill
              className="object-cover"
            />
            
            {/* Status badge */}
            {item.status === 'completed' && (
              <div className="absolute top-0 right-0 m-2 p-1 rounded-full bg-green-500">
                <CheckCircleIcon className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </Link>
      </div>
      
      {/* Novel details */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <Link href={`/novels/${item.slug}`}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                {item.title}
              </h2>
            </Link>
            <p className="text-gray-600 dark:text-gray-400">
              {item.author}
            </p>
          </div>
          
          {/* Status dropdown */}
          <div className="flex-shrink-0">
            <StatusDropdown 
              status={item.status}
              options={statusOptions}
              onChange={(newStatus) => onUpdateStatus(item.id, newStatus)}
            />
          </div>
        </div>
        
        {/* Reading progress */}
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tiến độ: <span className="font-medium text-gray-900 dark:text-white">{item.progress.toFixed(1)}%</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">Chương {item.lastChapter}</span> / {item.totalChapters}
            </p>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full ${
                item.status === 'completed' 
                  ? 'bg-green-500' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}
              style={{ width: `${item.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row justify-between sm:items-center">
          {/* Last read timestamp */}
          <p className="text-xs text-gray-500 dark:text-gray-500 order-2 sm:order-1">
            Đọc gần đây: {new Date(item.lastRead).toLocaleDateString('vi-VN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
          
          {/* Continue reading button */}
          {item.status !== 'completed' && (
            <Link 
              href={`/novels/${item.slug}/chapter-${item.lastChapter}`}
              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700
                transition-colors duration-200 text-sm mb-2 sm:mb-0 order-1 sm:order-2 self-start"
            >
              Tiếp tục đọc
            </Link>
          )}
          
          {/* Read again button */}
          {item.status === 'completed' && (
            <Link 
              href={`/novels/${item.slug}/chapter-1`}
              className="px-4 py-1.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700
                transition-colors duration-200 text-sm mb-2 sm:mb-0 order-1 sm:order-2 self-start"
            >
              Đọc lại
            </Link>
          )}
        </div>
      </div>
    </div>
  )
} 