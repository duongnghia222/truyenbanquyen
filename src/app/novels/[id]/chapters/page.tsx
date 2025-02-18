import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Novel from '@/models/Novel';
import Chapter from '@/models/Chapter';

interface ChaptersPageProps {
  params: Promise<{ id: string }>;
}

interface ChapterType {
  _id: string;
  chapterNumber: number;
  title: string;
  views: number;
  createdAt: string;
}

async function getNovelAndChapters(params: Promise<{ id: string }>) {
  const { id } = await params;
  try {
    await connectDB();
    const [novel, chapters] = await Promise.all([
      Novel.findById(id).lean(),
      Chapter.find({ novelId: id })
        .sort({ chapterNumber: 1 })
        .select('chapterNumber title views createdAt')
        .lean(),
    ]);

    if (!novel) return null;

    return {
      novel: JSON.parse(JSON.stringify(novel)),
      chapters: JSON.parse(JSON.stringify(chapters)),
    };
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return null;
  }
}

export async function generateMetadata(
  { params }: ChaptersPageProps,
  parent: Promise<Metadata>
): Promise<Metadata> {
  await parent;
  
  const data = await getNovelAndChapters(params);
  if (!data) {
    return {
      title: 'Không tìm thấy truyện',
    };
  }

  return {
    title: `Danh sách chương - ${data.novel.title} - TruyenBanQuyen`,
    description: `Đọc truyện ${data.novel.title} - ${data.novel.author}`,
  };
}

export default async function ChaptersPage({ params }: ChaptersPageProps) {
  const data = await getNovelAndChapters(params);
  if (!data) notFound();

  const { novel, chapters } = data;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600">
                Trang chủ
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link href={`/novels/${novel._id}`} className="hover:text-blue-600">
                {novel.title}
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium">Danh sách chương</li>
          </ol>
        </nav>

        {/* Novel Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{novel.title}</h1>
          <p className="mt-2 text-lg text-gray-600">{novel.author}</p>
        </div>

        {/* Chapters List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Danh Sách Chương ({chapters.length})
            </h2>
            <div className="flex items-center space-x-4">
              <button className="text-sm text-gray-500 hover:text-blue-600">
                Mới nhất
              </button>
              <button className="text-sm text-gray-500 hover:text-blue-600">
                Cũ nhất
              </button>
            </div>
          </div>

          {chapters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có chương nào được đăng tải.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {chapters.map((chapter: ChapterType) => (
                <Link
                  key={chapter._id}
                  href={`/novels/${novel._id}/chapters/${chapter.chapterNumber}`}
                  className="block py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Chương {chapter.chapterNumber}: {chapter.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {chapter.views.toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 