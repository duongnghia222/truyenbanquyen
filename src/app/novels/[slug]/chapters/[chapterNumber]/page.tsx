import Link from 'next/link';
import { notFound } from 'next/navigation';
import CommentSection from '@/components/CommentSection';
import { Chapter, NovelInfo } from '@/types/novel';

async function getChapter(slug: string, chapterNumber: string): Promise<Chapter> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://truyenlight.com';
  const res = await fetch(
    `${baseUrl}/api/novels/${slug}/chapters/${chapterNumber}`,
    {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch chapter');
  }
  
  return res.json();
}

async function getNovelInfo(slug: string): Promise<NovelInfo> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://truyenlight.com';
  const res = await fetch(
    `${baseUrl}/api/novels/${slug}`,
    {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch novel info');
  }
  
  return res.json();
}

async function getChapterContent(contentUrl: string): Promise<string> {
  try {
    const res = await fetch(contentUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch chapter content: ${res.status} ${res.statusText}`);
    }
    return res.text();
  } catch (error) {
    console.error('Error fetching chapter content:', error);
    return 'Không thể tải nội dung chương. Vui lòng thử lại sau.';
  }
}

export default async function ChapterPage({ 
  params 
}: { 
  params: Promise<{ slug: string; chapterNumber: string }>
}) {
  try {
    const { slug, chapterNumber } = await params;
    
    // Fetch the chapter and novel info in parallel
    const [chapter, novelInfo] = await Promise.all([
      getChapter(slug, chapterNumber),
      getNovelInfo(slug)
    ]);
    
    // Fetch chapter content
    const content = chapter.contentUrl 
      ? await getChapterContent(chapter.contentUrl)
      : 'Nội dung chương không có sẵn.';
    
    // Format content for display
    const formattedContent = content
      .split('\n\n')
      .filter(paragraph => paragraph.trim().length > 0);
    
    // Calculate previous and next chapter numbers
    const chapterNum = parseInt(chapterNumber);
    const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
    const nextChapter = chapterNum < novelInfo.chapterCount ? chapterNum + 1 : null;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-8">
            <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Trang chủ</Link>
              <span className="mx-2">/</span>
              <Link href={`/novels/${slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{novelInfo.title}</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-white font-medium">Chương {chapter.chapterNumber}</span>
            </nav>
          </div>
          
          {/* Chapter navigation */}
          <div className="flex justify-between items-center mb-6">
            <div>
              {prevChapter && (
                <Link 
                  href={`/novels/${slug}/chapters/${prevChapter}`}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Chương trước</span>
                </Link>
              )}
            </div>
            
            <div>
              <Link 
                href={`/novels/${slug}/chapters`}
                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                <span>Danh sách chương</span>
              </Link>
            </div>
            
            <div>
              {nextChapter && (
                <Link 
                  href={`/novels/${slug}/chapters/${nextChapter}`}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span>Chương sau</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
          
          {/* Chapter content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 mb-8">
            <div className="p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                {chapter.title || `Chương ${chapter.chapterNumber}`}
              </h1>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {formattedContent.map((paragraph, index) => (
                  <p 
                    key={index} 
                    className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
                    style={{ textAlign: 'justify' }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
          
          {/* Bottom navigation */}
          <div className="flex justify-between items-center mb-12">
            <div>
              {prevChapter && (
                <Link 
                  href={`/novels/${slug}/chapters/${prevChapter}`}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Chương trước</span>
                </Link>
              )}
            </div>
            
            <div>
              <Link 
                href={`/novels/${slug}`}
                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>Trang truyện</span>
              </Link>
            </div>
            
            <div>
              {nextChapter && (
                <Link 
                  href={`/novels/${slug}/chapters/${nextChapter}`}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span>Chương sau</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
          
          {/* Comment Section */}
          <div id="comments" className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Bình luận</h2>
            <CommentSection 
              novelId={novelInfo._id} 
              chapterNumber={chapter.chapterNumber} 
            />
          </div>
          
          {/* Error UI */}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in ChapterPage:', error);
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Đã xảy ra lỗi</h1>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Không thể tải nội dung chương. Vui lòng thử lại sau hoặc liên hệ quản trị viên.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href={`/novels/${params.then(p => p.slug).catch(() => '')}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <span>Quay lại trang truyện</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
} 