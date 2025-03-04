interface Genre {
  name: string
  slug: string
  icon?: string
}

export const genres: Genre[][] = [
  [
    { name: 'Bách Hợp', slug: 'bach-hop', icon: '♀' },
    { name: 'Dị Giới', slug: 'di-gioi' },
    { name: 'Hài Hước', slug: 'hai-huoc' },
    { name: 'Khoa Huyễn', slug: 'khoa-huyen', icon: '🔬' },
    { name: 'Linh Dị', slug: 'linh-di' },
    { name: 'Ngược', slug: 'nguoc' },
    { name: 'Phương Tây', slug: 'phuong-tay' },
    { name: 'Sủng', slug: 'sung', icon: '❤' },
    { name: 'Truyện Teen', slug: 'truyen-teen', icon: '👶' },
    { name: 'Tổng Tài', slug: 'tong-tai' },
    { name: 'Xuyên Không', slug: 'xuyen-khong', icon: '↩' },
    { name: 'Điền Văn', slug: 'dien-van' }
  ],
  [
    { name: 'Cận Đại', slug: 'can-dai' },
    { name: 'Dị Năng', slug: 'di-nang' },
    { name: 'Hắc Bang', slug: 'hac-bang' },
    { name: 'Kiếm Hiệp', slug: 'kiem-hiep' },
    { name: 'Mạt Thế', slug: 'mat-the' },
    { name: 'Nữ Cường', slug: 'nu-cuong' },
    { name: 'Quân Nhân', slug: 'quan-nhan' },
    { name: 'Tiên Hiệp', slug: 'tien-hiep' },
    { name: 'Trọng Sinh', slug: 'trong-sinh' },
    { name: 'Võng Du', slug: 'vong-du', icon: '🎮' },
    { name: 'Xuyên Nhanh', slug: 'xuyen-nhanh' },
    { name: 'Đô Thị', slug: 'do-thi' }
  ],
  [
    { name: 'Cổ Đại', slug: 'co-dai' },
    { name: 'Huyền Huyễn', slug: 'huyen-huyen', icon: '✨' },
    { name: 'Hệ Thống', slug: 'he-thong', icon: '⚙' },
    { name: 'Kỳ Huyễn', slug: 'ky-huyen' },
    { name: 'Ngôn Tình', slug: 'ngon-tinh', icon: '💕' },
    { name: 'Nữ Phụ', slug: 'nu-phu' },
    { name: 'Showbiz', slug: 'showbiz' },
    { name: 'Trinh Thám', slug: 'trinh-tham' },
    { name: 'Tương Lai', slug: 'tuong-lai' },
    { name: 'Vườn Trường', slug: 'vuon-truong' },
    { name: 'Đam Mỹ', slug: 'dam-my', icon: '🌹' },
    { name: 'Đồng Nhân', slug: 'dong-nhan', icon: '©' }
  ]
] 