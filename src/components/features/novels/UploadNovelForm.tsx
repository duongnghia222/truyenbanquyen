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

      // First, upload the image to S3
      const imageFormData = new FormData();
      imageFormData.append('file', coverImage);

      try {
        // Create a controller to allow timeout
        const controller = new AbortController();
        const uploadTimeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        const uploadResponse = await fetch('/api/novels/upload/cover', {
          method: 'POST',
          body: imageFormData,
          signal: controller.signal
        });
        
        clearTimeout(uploadTimeout);
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({
            error: 'Không thể xử lý phản hồi từ máy chủ'
          }));
          throw new Error(errorData.error || `Lỗi tải lên ảnh bìa: ${uploadResponse.status}`);
        }
        
        const uploadData = await uploadResponse.json();

        // Then submit the novel data with cover image URL only
        const novelData = {
          title: formData.title,
          author: formData.author,
          description: formData.description,
          status: formData.status,
          genres: formData.genres,
          coverImage: uploadData.fileUrl
        };

        // Set a timeout for the novel creation request
        const novelController = new AbortController();
        const novelTimeout = setTimeout(() => novelController.abort(), 60000); // 60 second timeout
        
        // Submit novel data
        const response = await fetch('/api/novels/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novelData),
          signal: novelController.signal
        });
        
        clearTimeout(novelTimeout);
        
        // Handle non-ok responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: 'Không thể xử lý phản hồi từ máy chủ'
          }));
          throw new Error(errorData.error || `Lỗi đăng tải truyện: ${response.status}`);
        }
        
        const data = await response.json();

        // Redirect to novel chapters page for uploading chapters
        router.push(`/novels/${data._id}/upload`);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          throw new Error('Yêu cầu quá thời gian, vui lòng thử lại sau');
        }
        throw fetchError;
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Không thể đăng tải truyện');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-base font-semibold text-gray-800 dark:text-gray-100">
              Tên Truyện <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="VD: Võ Luyện Đỉnh Phong"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 
                !bg-white !dark:bg-gray-900 !text-gray-900 !dark:text-white
                px-4 py-3 shadow-sm
                focus:border-blue-500 dark:focus:border-blue-400 
                focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
                placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Author Input */}
          <div>
            <label htmlFor="author" className="block text-base font-semibold text-gray-800 dark:text-gray-100">
              Tác Giả <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="author"
              name="author"
              required
              placeholder="VD: Mạc Mặc"
              value={formData.author}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 
                !bg-white !dark:bg-gray-900 !text-gray-900 !dark:text-white
                px-4 py-3 shadow-sm
                focus:border-blue-500 dark:focus:border-blue-400 
                focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
                placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-base font-semibold text-gray-800 dark:text-gray-100">
              Mô Tả <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              placeholder="Mô tả ngắn gọn về nội dung truyện..."
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="mt-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 
                !bg-white !dark:bg-gray-900 !text-gray-900 !dark:text-white
                px-4 py-3 shadow-sm
                focus:border-blue-500 dark:focus:border-blue-400 
                focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
                placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label htmlFor="status" className="block text-base font-semibold text-gray-800 dark:text-gray-100">
              Trạng Thái
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 
                !bg-white !dark:bg-gray-900 !text-gray-900 !dark:text-white
                px-4 py-3 shadow-sm
                focus:border-blue-500 dark:focus:border-blue-400 
                focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
            >
              <option value="ongoing">Đang Ra</option>
              <option value="completed">Hoàn Thành</option>
              <option value="hiatus">Tạm Dừng</option>
            </select>
          </div>

          {/* Genres Selection */}
          <div>
            <label className="block text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Thể Loại <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    formData.genres.includes(genre)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:from-blue-600 hover:to-purple-600'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Ảnh Bìa <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-700 dark:text-gray-300
                      file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0
                      file:text-sm file:font-medium 
                      file:bg-blue-50 dark:file:bg-blue-900/30
                      file:text-blue-700 dark:file:text-blue-300
                      hover:file:bg-blue-100 dark:hover:file:bg-blue-900/40
                      file:transition-all file:duration-200"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  JPEG, PNG, hoặc WebP. Tối đa 5MB.
                </p>
              </div>
              {imagePreview && (
                <div className="relative h-32 w-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                  <Image
                    src={imagePreview}
                    alt="Xem trước ảnh bìa"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/10 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 rounded-lg text-base font-medium
                text-white bg-gradient-to-r from-blue-500 to-purple-500 
                hover:from-blue-600 hover:to-purple-600 shadow-md
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2
                dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300"
            >
              {isSubmitting ? 'Đang Đăng Tải...' : 'Đăng Truyện'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
} 