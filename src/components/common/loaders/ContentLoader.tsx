interface ContentLoaderProps {
  minHeight?: string
}

export function ContentLoader({ minHeight = "70vh" }: ContentLoaderProps) {
  return (
    <div className={`flex justify-center items-center min-h-[${minHeight}]`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
} 