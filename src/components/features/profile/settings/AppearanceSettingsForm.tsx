import React from 'react'

type AppearanceSettingsFormProps = {
  theme: string
  toggleTheme: () => void
}

export const AppearanceSettingsForm = ({
  theme,
  toggleTheme
}: AppearanceSettingsFormProps) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Cài đặt giao diện
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Chế độ tối</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {theme === 'dark' ? 'Chế độ tối đang bật' : 'Chế độ tối đang tắt'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={theme === 'dark'}
              onChange={toggleTheme}
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
    </div>
  )
} 