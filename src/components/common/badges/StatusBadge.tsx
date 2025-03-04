import { ReactNode } from 'react'

export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'default'

interface StatusBadgeProps {
  children: ReactNode
  variant?: StatusVariant
  className?: string
  dot?: boolean
}

export function StatusBadge({
  children,
  variant = 'default',
  className = '',
  dot = false
}: StatusBadgeProps) {
  const variantClasses = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  const dotColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    default: 'bg-gray-500'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {dot && (
        <span className={`-ml-0.5 mr-1.5 h-2 w-2 rounded-full ${dotColors[variant]}`}></span>
      )}
      {children}
    </span>
  )
} 