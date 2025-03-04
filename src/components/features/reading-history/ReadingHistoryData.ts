export interface ReadingHistoryItem {
  id: number
  title: string
  author: string
  cover: string
  slug: string
  lastChapter: number
  totalChapters: number
  lastRead: string
  progress: number
  status: 'reading' | 'completed' | 'on_hold'
}

// Mock data for reading history
export const mockHistory: ReadingHistoryItem[] = [
  {
    id: 1,
    title: 'Thiên Đạo Đồ Thư Quán',
    author: 'Hoành Tảo Thiên Nhai',
    cover: 'https://duongnghia222.s3.ap-southeast-2.amazonaws.com/covers/thien-dao-do-thu-quan.jpg',
    slug: 'thien-dao-do-thu-quan',
    lastChapter: 56,
    totalChapters: 1542,
    lastRead: '2024-02-28T03:25:43.511Z',
    progress: 3.6,
    status: 'reading'
  },
  {
    id: 2,
    title: 'Thần Cấp Thăng Cấp Hệ Thống',
    author: 'Tiểu Lý Phi Đao',
    cover: 'https://duongnghia222.s3.ap-southeast-2.amazonaws.com/covers/than-cap-thang-cap-he-thong.jpg',
    slug: 'than-cap-thang-cap-he-thong',
    lastChapter: 123,
    totalChapters: 876,
    lastRead: '2024-02-25T15:12:23.511Z',
    progress: 14.0,
    status: 'reading'
  },
  {
    id: 3,
    title: 'Đấu Phá Thương Khung',
    author: 'Thiên Tàm Thổ Đậu',
    cover: 'https://duongnghia222.s3.ap-southeast-2.amazonaws.com/covers/dau-pha-thuong-khung.jpg',
    slug: 'dau-pha-thuong-khung',
    lastChapter: 1245,
    totalChapters: 1245,
    lastRead: '2024-02-20T09:45:32.511Z',
    progress: 100,
    status: 'completed'
  },
  {
    id: 4,
    title: 'Vô Thường',
    author: 'Tiểu Xuân Tử',
    cover: 'https://duongnghia222.s3.ap-southeast-2.amazonaws.com/covers/vo-thuong.jpg',
    slug: 'vo-thuong',
    lastChapter: 56,
    totalChapters: 342,
    lastRead: '2024-02-10T14:28:52.511Z',
    progress: 16.4,
    status: 'on_hold'
  }
] 