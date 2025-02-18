import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Novel from '@/models/Novel';
import Chapter from '@/models/Chapter';

interface NovelType {
  _id: string;
  title: string;
  author: string;
  contentUrl: string;
  views: number;
}

interface ChapterType {
  _id: string;
  novelId: string;
  chapterNumber: number;
  title: string;
  content?: string;
  views: number;
  createdAt: Date;
}

interface ChapterPageProps {
  params: Promise<{ id: string; number: string }>;
}

async function getNovelAndChapter(params: Promise<{ id: string; number: string }>) {
  const { id, number } = await params;
  try {
    await connectDB();

    // Increment view count
    await Chapter.findOneAndUpdate(
      { novelId: id, chapterNumber: Number(number) },
      { $inc: { views: 1 } }
    );

    const [novelDoc, chapterDoc, prevChapterDoc, nextChapterDoc] = await Promise.all([
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

    if (!novelDoc || !chapterDoc) {
      console.error('Novel or chapter not found:', { id, number, novel: !!novelDoc, chapter: !!chapterDoc });
      return null;
    }

    const novel = novelDoc as unknown as NovelType;
    const chapter = chapterDoc as unknown as ChapterType;
    const prevChapter = prevChapterDoc as unknown as ChapterType | null;
    const nextChapter = nextChapterDoc as unknown as ChapterType | null;

    // Fetch content from S3
    const response = await fetch(novel.contentUrl);
    if (!response.ok) {
      console.error('Failed to fetch content from S3:', response.statusText);
      return null;
    }

    const fullContent = await response.text();

    // Split content into chapters using the same regex as upload
    const chapterRegex = /^Chương\s+(\d+)(?:[\s:]+(.+?))?(?:\n|\r\n)([\s\S]*?)(?=(?:\n|\r\n)Chương\s+\d+|$)/gm;
    let match;

    while ((match = chapterRegex.exec(fullContent)) !== null) {
      const [, chapterNum, , chapterContent] = match;
      if (parseInt(chapterNum) === parseInt(number)) {
        chapter.content = chapterContent.trim();
        break;
      }
    }

    // If no chapters found or requested chapter not found, use the entire content
    if (!chapter.content) {
      chapter.content = fullContent.trim();
    }

    // Also increment novel views
    await Novel.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return {
      novel: JSON.parse(JSON.stringify(novel)),
      chapter: JSON.parse(JSON.stringify(chapter)),
      prevChapter: JSON.parse(JSON.stringify(prevChapter)),
      nextChapter: JSON.parse(JSON.stringify(nextChapter)),
    };
  } catch (error) {
    console.error('Error fetching chapter:', error);
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
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-800/20 p-6">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-300">
                  Trang chủ
                </Link>
              </li>
              <li>
                <span className="mx-2 dark:text-gray-500">/</span>
              </li>
              <li>
                <Link href={`/novels/${novel._id}`} className="hover:text-blue-600 dark:hover:text-blue-300">
                  {novel.title}
                </Link>
              </li>
              <li>
                <span className="mx-2 dark:text-gray-500">/</span>
              </li>
              <li>
                <Link href={`/novels/${novel._id}/chapters`} className="hover:text-blue-600 dark:hover:text-blue-300">
                  Danh sách chương
                </Link>
              </li>
              <li>
                <span className="mx-2 dark:text-gray-500">/</span>
              </li>
              <li className="text-gray-900 dark:text-gray-200 font-medium">
                Chương {chapter.chapterNumber}
              </li>
            </ol>
          </nav>

          {/* Chapter Info */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              Chương {chapter.chapterNumber}: {chapter.title}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {novel.title} - {novel.author}
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mb-8">
            {prevChapter ? (
              <Link
                href={`/novels/${novel._id}/chapters/${prevChapter.chapterNumber}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                ← Chương trước
              </Link>
            ) : (
              <div className="px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-not-allowed">
                ← Chương trước
              </div>
            )}
            
            <Link
              href={`/novels/${novel._id}/chapters`}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
            >
              Mục lục
            </Link>
            
            {nextChapter ? (
              <Link
                href={`/novels/${novel._id}/chapters/${nextChapter.chapterNumber}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Chương sau →
              </Link>
            ) : (
              <div className="px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-not-allowed">
                Chương sau →
              </div>
            )}
          </div>

          {/* Chapter Content */}
          <article className="prose prose-lg max-w-none mx-auto">
            <div className="whitespace-pre-line text-[19px] leading-[1.8] tracking-wide font-normal text-gray-900 dark:text-gray-100 antialiased">
              {chapter.content?.split('\n').map((paragraph: string, index: number) => (
                paragraph.trim() && (
                  <p key={index} className="mb-7 max-w-[70ch] mx-auto">
                    {paragraph}
                  </p>
                )
              ))}
            </div>
          </article>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between mt-8">
            {prevChapter ? (
              <Link
                href={`/novels/${novel._id}/chapters/${prevChapter.chapterNumber}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                ← Chương trước
              </Link>
            ) : (
              <div className="px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-not-allowed">
                ← Chương trước
              </div>
            )}
            
            <Link
              href={`/novels/${novel._id}/chapters`}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
            >
              Mục lục
            </Link>
            
            {nextChapter ? (
              <Link
                href={`/novels/${novel._id}/chapters/${nextChapter.chapterNumber}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Chương sau →
              </Link>
            ) : (
              <div className="px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-not-allowed">
                Chương sau →
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 