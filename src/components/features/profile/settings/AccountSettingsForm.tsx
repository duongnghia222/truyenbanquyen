import React from 'react'

type AccountFormData = {
  name: string
  username: string
  email: string
}

type AccountSettingsFormProps = {
  formData: AccountFormData
  isLoading: boolean
  error: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export const AccountSettingsForm = ({
  formData,
  isLoading,
  error,
  handleInputChange,
  handleSubmit
}: AccountSettingsFormProps) => {
  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Thông tin cá nhân
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label 
            htmlFor="name" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Tên hiển thị
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label 
            htmlFor="username" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Tên người dùng
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập tên người dùng của bạn"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tên người dùng phải có ít nhất 3 ký tự và là duy nhất
          </p>
        </div>
        
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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