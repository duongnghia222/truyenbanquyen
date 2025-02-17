import UploadNovelForm from '@/components/novels/UploadNovelForm';

export const metadata = {
  title: 'Đăng Truyện - TruyenBanQuyen',
  description: 'Đăng tải truyện mới lên TruyenBanQuyen',
};

export default function UploadNovelPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Đăng Truyện</h1>
        <p className="mt-2 text-gray-600">
          Điền thông tin bên dưới để đăng tải truyện của bạn. Các trường đánh dấu * là bắt buộc.
        </p>
      </div>
      
      <UploadNovelForm />
    </div>
  );
} 