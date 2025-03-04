'use client'

interface Tab {
  id: string
  name: string
  count: number
}

interface ReadingHistoryTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function ReadingHistoryTabs({ tabs, activeTab, onTabChange }: ReadingHistoryTabsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap
              ${activeTab === tab.id
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>
    </div>
  )
} 