export interface Novel {
  id: string
  title: string
  slug: string
  coverImage: string
  rating: number
  viewCount: number
  chapterCount: number
  author: string
  genres: string[]
  description?: string
  status?: 'ongoing' | 'completed' | 'hiatus'
  lastUpdated?: string
  uploaderUsername?: string
}

export interface Announcement {
  id: string
  title: string
  viewCount: number
  date: string
  content?: string
} 