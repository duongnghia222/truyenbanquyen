import Link from 'next/link'

interface SectionHeaderProps {
  title: string
  description?: string
  viewAllLink?: string
  viewAllText?: string
}

export function SectionHeader({ 
  title, 
  description, 
  viewAllLink, 
  viewAllText = 'Xem tất cả'
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white relative inline-block">
          {title}
          <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-gradient-to-r from-blue-600 to-purple-600"></span>
        </h2>
        {description && (
          <p className="text-gray-500 dark:text-gray-400 mt-2">{description}</p>
        )}
      </div>
      
      {viewAllLink && (
        <Link 
          href={viewAllLink} 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors duration-200"
        >
          <span>{viewAllText}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      )}
    </div>
  )
} 