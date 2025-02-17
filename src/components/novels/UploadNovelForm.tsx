'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const GENRES = [
  'Hành Động', 'Phiêu Lưu', 'Hài Hước', 'Kịch Tính', 'Giả Tưởng',
  'Kinh Dị', 'Bí Ẩn', 'Lãng Mạn', 'Khoa Học', 'Đời Thường',
  'Siêu Nhiên', 'Gay Cấn', 'Võ Thuật', 'Lịch Sử'
];

export default function UploadNovelForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    status: 'ongoing',
    genres: [] as string[],
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres };
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh phải nhỏ hơn 5MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Vui lòng tải lên ảnh định dạng JPEG, PNG hoặc WebP');
      return;
    }

    setCoverImage(file);
    setError(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!coverImage) {
        throw new Error('Vui lòng chọn ảnh bìa');
      }

      if (formData.genres.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một thể loại');
      }

      const submitFormData = new FormData();
      submitFormData.append('title', formData.title);
      submitFormData.append('author', formData.author);
      submitFormData.append('description', formData.description);
      submitFormData.append('status', formData.status);
      submitFormData.append('genres', JSON.stringify(formData.genres));
      submitFormData.append('coverImage', coverImage);

      const response = await fetch('/api/novels/upload', {
        method: 'POST',
        body: submitFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể đăng tải truyện');
      }

      // Redirect to home page
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đăng tải truyện');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-6">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Tên Truyện *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="VD: Võ Luyện Đỉnh Phong"
            value={formData.title}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Author Input */}
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700">
            Tác Giả *
          </label>
          <input
            type="text"
            id="author"
            name="author"
            required
            placeholder="VD: Mạc Mặc"
            value={formData.author}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Mô Tả *
          </label>
          <textarea
            id="description"
            name="description"
            required
            placeholder="Mô tả ngắn gọn về nội dung truyện..."
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Status Selection */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Trạng Thái
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="ongoing">Đang Ra</option>
            <option value="completed">Hoàn Thành</option>
            <option value="hiatus">Tạm Dừng</option>
          </select>
        </div>

        {/* Genres Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thể Loại *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {GENRES.map(genre => (
              <button
                key={genre}
                type="button"
                onClick={() => handleGenreToggle(genre)}
                className={`px-4 py-2 rounded-md text-sm ${
                  formData.genres.includes(genre)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh Bìa *
          </label>
          <div className="flex items-center space-x-6">
            <div className="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                JPEG, PNG, hoặc WebP. Tối đa 5MB.
              </p>
            </div>
            {imagePreview && (
              <div className="relative h-32 w-24">
                <Image
                  src={imagePreview}
                  alt="Xem trước ảnh bìa"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm mt-2">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang Đăng Tải...' : 'Đăng Truyện'}
        </button>
      </div>
    </form>
  );
} 