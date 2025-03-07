import React from 'react'

type NotificationFormData = {
  emailNotifications: boolean
  chapterUpdates: boolean
  systemNotifications: boolean
}

type NotificationSettingsFormProps = {
  formData: NotificationFormData
  isLoading: boolean
  error: string
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export const NotificationSettingsForm = ({
  formData,
  isLoading,
  error,
  handleCheckboxChange,
  handleSubmit
}: NotificationSettingsFormProps) => {
  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Cài đặt thông báo
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Thông báo qua email</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Nhận thông báo qua email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              name="emailNotifications"
              checked={formData.emailNotifications}
              onChange={handleCheckboxChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
              dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
              after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
              after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
              after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Thông báo cập nhật chương mới</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Nhận thông báo khi truyện bạn theo dõi có chương mới</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              name="chapterUpdates"
              checked={formData.chapterUpdates}
              onChange={handleCheckboxChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
              dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
              after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
              after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
              after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Thông báo hệ thống</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Nhận thông báo cập nhật từ hệ thống</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              name="systemNotifications"
              checked={formData.systemNotifications}
              onChange={handleCheckboxChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
              dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
              after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
              after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
              after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium 
            hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  )
} 