'use client'

export function ProfileRecentActivity() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Hoạt Động Gần Đây</h2>
      
      <div className="space-y-6">
        {/* If no activity yet */}
        {true && (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              Chưa có hoạt động nào gần đây
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 