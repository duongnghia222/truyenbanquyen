'use client'

import { useState } from 'react'
import { StatusDropdown, StatusOption } from '@/components/common'
import { PageHeader } from '@/components/common'

export default function ComponentTestPage() {
  const [currentStatus, setCurrentStatus] = useState('reading')
  
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
    },
    { 
      id: 'dropped', 
      label: 'Đã bỏ', 
      color: 'bg-red-100', 
      textColor: 'text-red-800' 
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Component Test Page" 
        description="Testing the StatusDropdown component"
      />
      
      <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Status Dropdown Test</h2>
        <div className="flex items-center gap-4">
          <span>Current Status:</span>
          <StatusDropdown 
            status={currentStatus}
            options={statusOptions}
            onChange={setCurrentStatus}
          />
        </div>
        <div className="mt-4">
          Selected status: <span className="font-bold">{currentStatus}</span>
        </div>
      </div>
    </div>
  )
} 