import Link from 'next/link';

export default function ChapterNotFound() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Không Tìm Thấy Chương
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Chương bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Về Trang Chủ
          </Link>
          <Link
            href="/novels"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Danh Sách Truyện
          </Link>
        </div>
      </div>
    </main>
  );
} 