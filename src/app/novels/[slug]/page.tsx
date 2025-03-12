import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { User } from 'lucide-react';
import CommentSection from '@/components/CommentSection';

interface Novel {
  _id: string;
  title: string;
  slug: string;
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
  uploaderUsername?: string;
}

async function getNovel(slug: string): Promise<Novel> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://truyenlight.com';
  
  try {
    console.log(`Fetching novel with slug: ${slug} from ${baseUrl}/api/novels/${slug}`);
    
    const res = await fetch(`${baseUrl}/api/novels/${slug}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        console.error(`Novel with slug ${slug} not found`);
        notFound();
      }
      
      // Try to get more information about the error
      const errorText = await res.text();
      console.error(`Failed to fetch novel: ${res.status} ${res.statusText}`);
      console.error(`Error response: ${errorText.substring(0, 200)}...`);
      
      throw new Error(`Failed to fetch novel: ${res.status} ${res.statusText}`);
    }
    
    // Parse the JSON response safely
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response text (first 200 chars):', text.substring(0, 200));
      throw new Error('Invalid JSON response from API');
    }
  } catch (error) {
    console.error('Error in getNovel function:', error);
    throw error;
  }
}

// Format text with proper line breaks for Vietnamese text
function formatText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

// Format description with proper paragraph breaks
function formatDescription(description: string): string {
  // Split by double newlines or other paragraph separators
  const paragraphs = description
    .split(/\n\n|\r\n\r\n|\n\r\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  return paragraphs.join('\n\n');
}

export default async function NovelDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }>
}) {
  try {
    const { slug } = await params;
    
    const novel = await getNovel(slug);
    
    // Format date
    const formattedDate = new Date(novel.createdAt).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Format description for better display
    const formattedDescription = formatDescription(novel.description);

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-8">
            <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Trang chủ</Link>
              <span className="mx-2">/</span>
              <Link href="/novel-list" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Danh sách</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px] md:max-w-md">{formatText(novel.title)}</span>
            </nav>
          </div>

          {/* Novel detail */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all hover:shadow-2xl">
            <div className="md:flex">
              {/* Cover image */}
              <div className="md:w-1/3 lg:w-1/4 p-8 flex justify-center">
                <div className="relative w-64 h-96 overflow-hidden rounded-xl shadow-lg">
                  <Image
                    src={novel.coverImage}
                    alt={novel.title}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 300px"
                    priority
                  />
                </div>
              </div>

              {/* Novel info */}
              <div className="md:w-2/3 lg:w-3/4 p-8">
                <h1 
                  className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight break-words hyphens-auto"
                  style={{ 
                    wordBreak: 'break-word', 
                    overflowWrap: 'break-word'
                  }}
                >
                  {formatText(novel.title)}
                </h1>
                
                <div className="mb-4 flex items-center text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Tác giả:</span>
                  <span className="ml-2 truncate">{formatText(novel.author)}</span>
                </div>
                
                {/* Uploader info with enhanced styling */}
                {novel.uploaderUsername && (
                  <div className="mb-4 flex items-center text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                      <User size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-sm">
                        <span className="font-medium text-blue-700 dark:text-blue-300">Đăng bởi:</span>
                        <span className="ml-1 text-blue-600 dark:text-blue-400 truncate">{novel.uploaderUsername}</span>
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="mb-6 flex flex-wrap gap-2">
                  {novel.genres.map((genre, index) => (
                    <span 
                      key={index} 
                      className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm transition-all hover:bg-blue-200 dark:hover:bg-blue-800 truncate max-w-[150px]"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                
                <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {novel.status === 'ongoing' && 'Đang Ra'}
                      {novel.status === 'completed' && 'Hoàn Thành'}
                      {novel.status === 'hiatus' && 'Tạm Dừng'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Số chương</div>
                    <div className="text-gray-900 dark:text-white font-medium">{novel.chapterCount.toLocaleString('vi-VN')}</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Lượt đọc</div>
                    <div className="text-gray-900 dark:text-white font-medium">{novel.views.toLocaleString('vi-VN')}</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Đánh giá</div>
                    <div className="text-gray-900 dark:text-white font-medium">{novel.rating.toFixed(1)}/5</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Đăng lúc</div>
                    <div className="text-gray-900 dark:text-white font-medium">{formattedDate}</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Giới thiệu</h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    {formattedDescription.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 break-words hyphens-auto"
                         style={{ 
                           wordBreak: 'break-word', 
                           overflowWrap: 'break-word',
                           textAlign: 'justify'
                         }}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
                
                {/* Read Button */}
                <div className="mt-8 flex gap-4">
                  <Link
                    href={`/novels/${novel.slug}/chapters`}
                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-base font-medium text-white shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all transform hover:scale-105"
                  >
                    Đọc Truyện
                  </Link>
                  
                  <a
                    href="#comments"
                    className="inline-flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-200 shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all"
                  >
                    Bình luận
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comment Section */}
          <div id="comments" className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Bình luận</h2>
            <CommentSection novelId={novel._id} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in NovelDetailPage:', error);
    
    // Return an error UI
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Trang chủ</Link>
              <span className="mx-2">/</span>
              <Link href="/novel-list" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Danh sách</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-white font-medium">Lỗi</span>
            </nav>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Đã xảy ra lỗi</h1>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Không thể tải thông tin truyện. Vui lòng thử lại sau hoặc liên hệ quản trị viên.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/novel-list"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-base font-medium text-white shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all transform hover:scale-105"
                >
                  Quay lại danh sách truyện
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-200 shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
} 