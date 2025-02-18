import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Novel from '@/models/Novel';

interface NovelPageProps {
  params: Promise<{ id: string }>;
}

async function getNovel(params: Promise<{ id: string }>) {
  const { id } = await params;
  try {
    await connectDB();
    const novel = await Novel.findById(id).lean();
    if (!novel) return null;
    return JSON.parse(JSON.stringify(novel));
  } catch (error) {
    console.error('Error fetching novel:', error);
    return null;
  }
}

export async function generateMetadata(
  { params }: NovelPageProps,
  parent: Promise<Metadata>
): Promise<Metadata> {
  // Wait for the parent metadata
  await parent;
  
  try {
    const novel = await getNovel(params);
    if (!novel) {
      return {
        title: 'Không tìm thấy truyện',
      };
    }

    return {
      title: `${novel.title} - TruyenBanQuyen`,
      description: novel.description,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Lỗi - TruyenBanQuyen',
      description: 'Đã xảy ra lỗi khi tải thông tin truyện',
    };
  }
}

export default async function NovelPage({ params }: NovelPageProps) {
  const novel = await getNovel(params);
  if (!novel) notFound();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                Trang chủ
              </Link>
            </li>
            <li>
              <span className="mx-2 dark:text-gray-500">/</span>
            </li>
            <li>
              <Link href="/novels" className="hover:text-blue-600 dark:hover:text-blue-400">
                Danh sách truyện
              </Link>
            </li>
            <li>
              <span className="mx-2 dark:text-gray-500">/</span>
            </li>
            <li className="text-gray-900 dark:text-gray-100 font-medium">{novel.title}</li>
          </ol>
        </nav>

        {/* Novel Info */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* Left Column - Cover Image */}
          <div className="space-y-4">
            <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-lg dark:shadow-gray-800/20">
              <Image
                src={novel.coverImage}
                alt={novel.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex justify-center">
              <Link
                href={`/novels/${novel._id}/chapters`}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-center transition-colors"
              >
                Đọc Truyện
              </Link>
            </div>
          </div>

          {/* Right Column - Novel Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{novel.title}</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{novel.author}</p>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {novel.views.toLocaleString()} lượt xem
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {novel.rating.toFixed(1)}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                novel.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 
                novel.status === 'ongoing' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 
                'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
              }`}>
                {novel.status === 'completed' ? 'Hoàn Thành' : 
                 novel.status === 'ongoing' ? 'Đang Ra' : 'Tạm Dừng'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {novel.genres.map((genre: string) => (
                <span
                  key={genre}
                  className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-3">Giới Thiệu</h2>
              <div className="prose prose-blue dark:prose-invert max-w-none">
                <p className="whitespace-pre-line text-gray-700 dark:text-gray-200 leading-relaxed">{novel.description}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-3">Thông Tin Thêm</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày đăng</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                    {new Date(novel.createdAt).toLocaleDateString('vi-VN')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Cập nhật</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                    {new Date(novel.updatedAt).toLocaleDateString('vi-VN')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 