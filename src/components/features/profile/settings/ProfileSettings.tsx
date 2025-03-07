import React from 'react'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useProfileSettings } from './useProfileSettings'
import { ProfileSettingsSidebar } from './ProfileSettingsSidebar'
import { AccountSettingsForm } from './AccountSettingsForm'
import { PasswordSettingsForm } from './PasswordSettingsForm'
import { NotificationSettingsForm } from './NotificationSettingsForm'
import { AppearanceSettingsForm } from './AppearanceSettingsForm'

export const ProfileSettings = () => {
  const { theme, toggleTheme } = useTheme()
  const {
    status,
    session,
    activeTab,
    setActiveTab,
    formData,
    isLoading,
    error,
    handleInputChange,
    handleCheckboxChange,
    handleSubmit
  } = useProfileSettings()

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Bạn cần đăng nhập để xem trang này
        </h1>
        <Link
          href="/auth/signin?callbackUrl=/profile/settings"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link 
          href="/profile"
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
            hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Cài Đặt Tài Khoản
        </h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="md:flex">
          {/* Sidebar */}
          <ProfileSettingsSidebar 
            session={session} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          
          {/* Content */}
          <div className="flex-1 p-6">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <AccountSettingsForm
                formData={formData}
                isLoading={isLoading}
                error={error}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
              />
            )}
            
            {/* Password Settings */}
            {activeTab === 'password' && (
              <PasswordSettingsForm
                formData={formData}
                isLoading={isLoading}
                error={error}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
              />
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <NotificationSettingsForm
                formData={formData}
                isLoading={isLoading}
                error={error}
                handleCheckboxChange={handleCheckboxChange}
                handleSubmit={handleSubmit}
              />
            )}
            
            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <AppearanceSettingsForm
                theme={theme}
                toggleTheme={toggleTheme}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 