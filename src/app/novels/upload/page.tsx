import { Metadata } from 'next';
import UploadNovelForm from '@/components/features/novels/UploadNovelForm';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';

export const metadata: Metadata = {
  title: 'Đăng Truyện - TruyenLight',
  description: 'Đăng tải truyện của bạn lên TruyenLight',
};

export default async function UploadNovelPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/novels/upload');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Đăng Truyện
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Chia sẻ tác phẩm của bạn với cộng đồng độc giả
          </p>
        </div>
        
        <UploadNovelForm />
      </div>
    </div>
  );
} 