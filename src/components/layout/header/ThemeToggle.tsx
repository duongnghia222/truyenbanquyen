'use client'

import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/components/providers/ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
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
  )
} 