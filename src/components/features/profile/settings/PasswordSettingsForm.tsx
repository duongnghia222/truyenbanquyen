import React from 'react'

type PasswordFormData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type PasswordSettingsFormProps = {
  formData: PasswordFormData
  isLoading: boolean
  error: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export const PasswordSettingsForm = ({
  formData,
  isLoading,
  error,
  handleInputChange,
  handleSubmit
}: PasswordSettingsFormProps) => {
  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Đổi mật khẩu
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label 
            htmlFor="currentPassword" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Mật khẩu hiện tại
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label 
            htmlFor="newPassword" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Mật khẩu mới
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label 
            htmlFor="confirmPassword" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Xác nhận mật khẩu mới
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
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
          {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </div>
    </form>
  )
} 