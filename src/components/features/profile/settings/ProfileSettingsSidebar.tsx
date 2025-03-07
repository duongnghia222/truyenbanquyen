import Image from 'next/image'
import { Session } from 'next-auth'
import { 
  UserIcon, 
  LockClosedIcon,
  BellIcon,
  PaintBrushIcon,
  CameraIcon
} from '@heroicons/react/24/outline'

type ProfileSettingsSidebarProps = {
  session: Session | null
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const ProfileSettingsSidebar = ({ 
  session, 
  activeTab, 
  setActiveTab 
}: ProfileSettingsSidebarProps) => {
  return (
    <div className="md:w-64 bg-gray-50 dark:bg-gray-900/50 p-6 border-r border-gray-200 dark:border-gray-700">
      <div className="text-center mb-6">
        <div className="relative w-24 h-24 mx-auto mb-3 group">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'Profile'}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 
            flex items-center justify-center transition-opacity duration-200 cursor-pointer">
            <CameraIcon className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {session?.user?.name || 'Người dùng'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {session?.user?.email || 'Chưa có email'}
        </p>
      </div>
      
      {/* Navigation */}
      <nav className="space-y-1">
        <button
          onClick={() => setActiveTab('account')}
          className={`w-full px-4 py-2.5 text-left rounded-lg flex items-center gap-3
            ${activeTab === 'account'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            } transition-colors duration-200`}
        >
          <UserIcon className="w-5 h-5" />
          <span>Thông tin cá nhân</span>
        </button>
        
        <button
          onClick={() => setActiveTab('password')}
          className={`w-full px-4 py-2.5 text-left rounded-lg flex items-center gap-3
            ${activeTab === 'password'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            } transition-colors duration-200`}
        >
          <LockClosedIcon className="w-5 h-5" />
          <span>Đổi mật khẩu</span>
        </button>
        
        <button
          onClick={() => setActiveTab('notifications')}
          className={`w-full px-4 py-2.5 text-left rounded-lg flex items-center gap-3
            ${activeTab === 'notifications'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            } transition-colors duration-200`}
        >
          <BellIcon className="w-5 h-5" />
          <span>Thông báo</span>
        </button>
        
        <button
          onClick={() => setActiveTab('appearance')}
          className={`w-full px-4 py-2.5 text-left rounded-lg flex items-center gap-3
            ${activeTab === 'appearance'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            } transition-colors duration-200`}
        >
          <PaintBrushIcon className="w-5 h-5" />
          <span>Giao diện</span>
        </button>
      </nav>
    </div>
  )
} 