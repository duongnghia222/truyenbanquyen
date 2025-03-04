import { BookmarkItem } from './BookmarkCard'

// Mock data for bookmarked novels
export const mockBookmarks: BookmarkItem[] = [
  {
    id: 1,
    title: 'Thiên Đạo Đồ Thư Quán',
    author: 'Hoành Tảo Thiên Nhai',
    cover: 'https://duongnghia222.s3.ap-southeast-2.amazonaws.com/covers/banner1.jpg',
    slug: 'thien-dao-do-thu-quan',
    rating: 4.5,
    lastChapter: 56,
    totalChapters: 1542,
    lastRead: '2024-02-28T03:25:43.511Z',
    genres: ['Huyền Huyễn', 'Tiên Hiệp'],
    favorite: true
  },
  {
    id: 2,
    title: 'Thần Cấp Thăng Cấp Hệ Thống',
    author: 'Tiểu Lý Phi Đao',
    cover: 'https://duongnghia222.s3.ap-southeast-2.amazonaws.com/covers/banner2.jpg',
    slug: 'than-cap-thang-cap-he-thong',
    rating: 4.2,
    lastChapter: 123,
    totalChapters: 876,
    lastRead: '2024-02-25T15:12:23.511Z',
    genres: ['Hệ Thống', 'Võng Du'],
    favorite: false
  },
  {
    id: 3,
    title: 'Đấu Phá Thương Khung',
    author: 'Thiên Tàm Thổ Đậu',
    cover: 'https://duongnghia222.s3.ap-southeast-2.amazonaws.com/covers/banner3.jpg',
    slug: 'dau-pha-thuong-khung',
    rating: 4.8,
    lastChapter: 234,
    totalChapters: 1245,
    lastRead: '2024-02-26T09:45:32.511Z',
    genres: ['Huyền Huyễn', 'Võ Hiệp'],
    favorite: true
  }
] 