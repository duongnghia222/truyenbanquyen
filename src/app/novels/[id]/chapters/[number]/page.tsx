import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Novel from '@/models/Novel';
import Chapter from '@/models/Chapter';

interface ChapterPageProps {
  params: Promise<{ id: string; number: string }>;
}

async function getNovelAndChapter(params: Promise<{ id: string; number: string }>) {
  const { id, number } = await params;
  try {
    await connectDB();
    const [novel, chapter, prevChapter, nextChapter] = await Promise.all([
      Novel.findById(id).lean(),
      Chapter.findOne({ novelId: id, chapterNumber: Number(number) }).lean(),
      Chapter.findOne({ novelId: id, chapterNumber: { $lt: Number(number) } })
        .sort({ chapterNumber: -1 })
        .select('chapterNumber')
        .lean(),
      Chapter.findOne({ novelId: id, chapterNumber: { $gt: Number(number) } })
        .sort({ chapterNumber: 1 })
        .select('chapterNumber')
        .lean(),
    ]);

    if (!novel || !chapter) return null;

    return {
      novel: JSON.parse(JSON.stringify(novel)),
      chapter: JSON.parse(JSON.stringify(chapter)),
      prevChapter: JSON.parse(JSON.stringify(prevChapter)),
      nextChapter: JSON.parse(JSON.stringify(nextChapter)),
    };
  } catch (error) {
    return null;
  }
}

export async function generateMetadata(
  { params }: ChapterPageProps,
  parent: Promise<Metadata>
): Promise<Metadata> {
  await parent;
  
  const data = await getNovelAndChapter(params);
  if (!data) {
    return {
      title: 'Không tìm thấy chương',
    };
  }

  return {
    title: `Chương ${data.chapter.chapterNumber}: ${data.chapter.title} - ${data.novel.title} - TruyenBanQuyen`,
    description: `Đọc truyện ${data.novel.title} - Chương ${data.chapter.chapterNumber}: ${data.chapter.title}`,
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const data = await getNovelAndChapter(params);
  if (!data) notFound();

  const { novel, chapter, prevChapter, nextChapter } = data;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
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
              <li>
                <Link href={`/novels/${novel._id}/chapters`} className="hover:text-blue-600">
                  Danh sách chương
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-gray-900 font-medium">
                Chương {chapter.chapterNumber}
              </li>
            </ol>
          </nav>

          {/* Chapter Info */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Chương {chapter.chapterNumber}: {chapter.title}
            </h1>
            <p className="mt-2 text-gray-600">
              {novel.title} - {novel.author}
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mb-8">
            {prevChapter ? (
              <Link
                href={`/novels/${novel._id}/chapters/${prevChapter.chapterNumber}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                ← Chương trước
              </Link>
            ) : (
              <div className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed">
                ← Chương trước
              </div>
            )}
            
            <Link
              href={`/novels/${novel._id}/chapters`}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Mục lục
            </Link>
            
            {nextChapter ? (
              <Link
                href={`/novels/${novel._id}/chapters/${nextChapter.chapterNumber}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Chương sau →
              </Link>
            ) : (
              <div className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed">
                Chương sau →
              </div>
            )}
          </div>

          {/* Chapter Content */}
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-line leading-relaxed text-gray-800">
              {chapter.content}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between mt-8">
            {prevChapter ? (
              <Link
                href={`/novels/${novel._id}/chapters/${prevChapter.chapterNumber}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                ← Chương trước
              </Link>
            ) : (
              <div className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed">
                ← Chương trước
              </div>
            )}
            
            <Link
              href={`/novels/${novel._id}/chapters`}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Mục lục
            </Link>
            
            {nextChapter ? (
              <Link
                href={`/novels/${novel._id}/chapters/${nextChapter.chapterNumber}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Chương sau →
              </Link>
            ) : (
              <div className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed">
                Chương sau →
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 