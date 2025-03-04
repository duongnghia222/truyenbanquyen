import Image from 'next/image'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' 

interface AvatarProps {
  src?: string | null
  alt: string
  size?: AvatarSize
  className?: string
  fallbackInitials?: string
}

export function Avatar({
  src,
  alt,
  size = 'md',
  className = '',
  fallbackInitials
}: AvatarProps) {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl'
  }

  const getInitials = () => {
    if (fallbackInitials) return fallbackInitials
    return alt
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  if (!src) {
    return (
      <div 
        className={`${sizeClasses[size]} inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 ${className}`}
        aria-label={alt}
      >
        {getInitials()}
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`(max-width: 768px) ${sizeClasses[size].split(' ')[1]}, ${sizeClasses[size].split(' ')[1]}`}
        className="object-cover"
      />
    </div>
  )
} 