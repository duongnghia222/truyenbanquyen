import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Novel, ChaptersResponse } from '@/types/novel';

async function getNovelAndChapters(slug: string): Promise<{ novel: Novel, chaptersData: ChaptersResponse }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://truyenlight.com';
  
  try {
    // First, get the novel to get its ID
    const novelRes = await fetch(`${baseUrl}/api/novels/${slug}`, {
      cache: 'no-store',
    });
    
    if (!novelRes.ok) {
      if (novelRes.status === 404) {
        notFound();
      }
      throw new Error(`Failed to fetch novel: ${novelRes.status} ${novelRes.statusText}`);
    }
    
    const novel = await novelRes.json();
    
    // Then, get the chapters using the novel slug
    const chaptersRes = await fetch(`${baseUrl}/api/novels/${slug}/chapters`, {
      cache: 'no-store',
    });
    
    if (!chaptersRes.ok) {
      throw new Error(`Failed to fetch chapters: ${chaptersRes.status} ${chaptersRes.statusText}`);
    }
    
    const chaptersData = await chaptersRes.json();
    
    return { novel, chaptersData };
  } catch (error) {
    console.error('Error fetching novel and chapters:', error);
    throw error;
  }
}

export default async function ChaptersPage({ 
  params 
}: { 
  params: Promise<{ slug: string }>
}) {
  try {
    const { slug } = await params;
    const { novel, chaptersData } = await getNovelAndChapters(slug);
    
    // Extract chapters array from the response
    const chapters = chaptersData.chapters || [];
    
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
              <Link href={`/novels/${novel.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{novel.title}</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-white font-medium">Danh sách chương</span>
            </nav>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">{novel.title} - Danh sách chương</h1>
              
              {chapters.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Chưa có chương nào</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Truyện này hiện chưa có chương nào được đăng tải.</p>
                  <Link
                    href={`/novels/${novel.slug}`}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all"
                  >
                    Quay lại trang truyện
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {chapters.map((chapter) => (
                    <div key={chapter._id} className="py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg px-4">
                      <Link 
                        href={`/novels/${novel.slug}/chapters/${chapter.chapterNumber}`}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium text-sm">
                            {chapter.chapterNumber}
                          </div>
                          <span className="text-gray-900 dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {chapter.title}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in ChaptersPage:', error);
    
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
                Không thể tải danh sách chương. Vui lòng thử lại sau hoặc liên hệ quản trị viên.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/novel-list"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-base font-medium text-white shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all transform hover:scale-105"
                >
                  Quay lại danh sách truyện
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
} 