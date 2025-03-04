import { ReactNode } from 'react'

interface GridLayoutProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function GridLayout({
  children,
  columns = 3,
  gap = 'md',
  className = ''
}: GridLayoutProps) {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  }

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  )
} 