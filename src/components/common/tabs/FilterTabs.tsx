'use client'

export interface TabItem {
  id: string
  label: string
  count?: number
}

interface FilterTabsProps {
  tabs: TabItem[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function FilterTabs({ 
  tabs, 
  activeTabId, 
  onTabChange,
  className = ''
}: FilterTabsProps) {
  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
        {tabs.map((tab) => (
          <li key={tab.id} className="mr-2">
            <button
              onClick={() => onTabChange(tab.id)}
              className={`inline-block p-4 rounded-t-lg ${
                activeTabId === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 border-b-2 border-transparent'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeTabId === tab.id
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
} 