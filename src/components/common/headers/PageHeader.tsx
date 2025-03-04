import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {action && <div>{action}</div>}
      </div>
      {description && (
        <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </div>
  )
} 