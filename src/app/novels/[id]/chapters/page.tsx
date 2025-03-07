import Link from 'next/link';
import { ChevronLeft, BookOpen, Eye, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';

interface Chapter {
  _id: string;
  title: string;
  chapterNumber: number;
  views: number;
  createdAt: string;
}

interface ChapterResponse {
  chapters: Chapter[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

async function getNovelChapters(id: string, page = 1): Promise<ChapterResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(
    `${baseUrl}/api/novels/${id}/chapters?page=${page}`,
    { cache: 'no-store' }
  );
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch chapters');
  }
  
  return res.json();
}

export default async function ChaptersPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr) : 1;
  const { chapters, pagination } = await getNovelChapters(id, page);

  // Format date to "Month Day, Year"
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header & Navigation */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chapter List</h1>
          
          <Link 
            href={`/novels/${id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-5 py-2.5 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 font-medium"
          >
            <ChevronLeft size={18} className="text-gray-500 dark:text-gray-400" />
            <span>Back to Novel</span>
          </Link>
        </div>

        {/* Stats summary */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-blue-500" />
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              {pagination.totalItems} {pagination.totalItems === 1 ? 'Chapter' : 'Chapters'}
            </span>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
        </div>

        {/* Chapter List */}
        <div className="rounded-xl bg-white dark:bg-gray-800 shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {chapters.map((chapter) => (
              <li key={chapter._id} className="group">
                <Link
                  href={`/novels/${id}/chapters/${chapter.chapterNumber}`}
                  className="block p-5 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold">
                        {chapter.chapterNumber}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          <span className="sm:hidden">#{chapter.chapterNumber}:</span> {chapter.title}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                            <Clock size={14} />
                            <span>{formatDate(chapter.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                            <Eye size={14} />
                            <span>{chapter.views.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <ChevronLeft size={16} className="rotate-180" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center gap-3">
          {pagination.hasPrevPage && (
            <Link
              href={`/novels/${id}/chapters?page=${page - 1}`}
              className="rounded-lg bg-white dark:bg-gray-800 px-5 py-2.5 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </Link>
          )}
          
          {pagination.hasNextPage && (
            <Link
              href={`/novels/${id}/chapters?page=${page + 1}`}
              className="rounded-lg bg-white dark:bg-gray-800 px-5 py-2.5 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
            >
              <span>Next</span>
              <ChevronLeft size={16} className="rotate-180" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 