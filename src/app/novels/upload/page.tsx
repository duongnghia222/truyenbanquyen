import UploadNovelForm from '@/components/novels/UploadNovelForm';

export const metadata = {
  title: 'Đăng Truyện - TruyenBanQuyen',
  description: 'Đăng tải truyện mới lên TruyenBanQuyen',
};

export default function UploadNovelPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Đăng Truyện
        </h1>
      </div>
      
      <UploadNovelForm />
    </div>
  );
} 