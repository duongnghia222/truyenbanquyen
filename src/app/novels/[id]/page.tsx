import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Novel {
  _id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  genres: string[];
  status: 'ongoing' | 'completed' | 'hiatus';
  views: number;
  rating: number;
  chapterCount: number;
  createdAt: string;
  updatedAt: string;
}

async function getNovel(id: string): Promise<Novel> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/v1/novels/${id}`, {
    next: {
      revalidate: 3600 // Revalidate every hour
    }
  });
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch novel');
  }
  
  return res.json();
}

export default async function NovelDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  const novel = await getNovel(id);
  
  // Format date
  const formattedDate = new Date(novel.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link href="/novel-list" className="hover:text-blue-600 dark:hover:text-blue-400">Danh sách</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white font-medium">{novel.title}</span>
          </nav>
        </div>

        {/* Novel detail */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Cover image */}
            <div className="md:w-1/3 lg:w-1/4 p-6 flex justify-center">
              <div className="relative w-64 h-96 overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={novel.coverImage}
                  alt={novel.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                  priority
                />
              </div>
            </div>

            {/* Novel info */}
            <div className="md:w-2/3 lg:w-3/4 p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{novel.title}</h1>
              
              <div className="mb-4 flex items-center text-gray-600 dark:text-gray-300">
                <span className="font-medium">Tác giả:</span>
                <span className="ml-2">{novel.author}</span>
              </div>
              
              <div className="mb-6 flex flex-wrap gap-2">
                {novel.genres.map((genre, index) => (
                  <span key={index} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                    {genre}
                  </span>
                ))}
              </div>
              
              <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {novel.status === 'ongoing' && 'Đang Ra'}
                    {novel.status === 'completed' && 'Hoàn Thành'}
                    {novel.status === 'hiatus' && 'Tạm Dừng'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Số chương</div>
                  <div className="text-gray-900 dark:text-white font-medium">{novel.chapterCount}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Lượt đọc</div>
                  <div className="text-gray-900 dark:text-white font-medium">{novel.views.toLocaleString()}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Đánh giá</div>
                  <div className="text-gray-900 dark:text-white font-medium">{novel.rating.toFixed(1)}/5</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Đăng lúc</div>
                  <div className="text-gray-900 dark:text-white font-medium">{formattedDate}</div>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Giới thiệu</h2>
                <div className="prose prose-gray dark:prose-invert prose-sm">
                  <p className="text-gray-700 dark:text-gray-300">{novel.description}</p>
                </div>
              </div>
              
              {/* Read Button */}
              <div className="mt-8">
                <Link
                  href={`/novels/${novel._id}/chapters`}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                  Đọc Truyện
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 