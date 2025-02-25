import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
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
    `${baseUrl}/api/v1/novels/${id}/chapters?page=${page}`,
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href={`/novels/${id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Back to Novel</span>
          </Link>

          <Link
            href={`/novels/${id}/upload`}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
          >
            Đăng tải chương mới
          </Link>
        </div>

        {/* Chapter List */}
        <div className="rounded-lg bg-white dark:bg-gray-800 shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {chapters.map((chapter) => (
              <li key={chapter._id}>
                <Link
                  href={`/novels/${id}/chapters/${chapter.chapterNumber}`}
                  className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {chapter.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(chapter.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {chapter.views.toLocaleString()} views
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center gap-2">
          {pagination.hasPrevPage && (
            <Link
              href={`/novels/${id}/chapters?page=${page - 1}`}
              className="rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-300 shadow-sm">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          {pagination.hasNextPage && (
            <Link
              href={`/novels/${id}/chapters?page=${page + 1}`}
              className="rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 