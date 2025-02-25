'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

interface UploadChapterFormProps {
  novelId: string;
}

export default function UploadChapterForm({ novelId }: UploadChapterFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    chapterNumber: ''
  });
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'text/plain') {
      setError('Vui lòng tải lên file định dạng .txt');
      return;
    }

    // Validate file size (1MB)
    if (file.size > 1 * 1024 * 1024) {
      setError('Kích thước file phải nhỏ hơn 1MB');
      return;
    }

    setContentFile(file);
    setFileName(file.name);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (!contentFile) {
        throw new Error('Vui lòng chọn file nội dung chương');
      }

      // First, upload the content file to S3
      const contentFormData = new FormData();
      contentFormData.append('file', contentFile);

      const uploadResponse = await fetch(`/api/v1/novels/${novelId}/chapters/upload/content`, {
        method: 'POST',
        body: contentFormData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Không thể tải lên file nội dung');
      }

      // Then create the chapter with the content URL
      const response = await fetch(`/api/v1/novels/${novelId}/chapters/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          chapterNumber: parseInt(formData.chapterNumber),
          contentUrl: uploadData.contentUrl
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tải lên chương');
      }

      // Set success message
      setSuccess('Đăng tải chương thành công!');

      // Reset form
      setFormData({
        title: '',
        chapterNumber: ''
      });
      setContentFile(null);
      setFileName('');
      if (e.target instanceof HTMLFormElement) {
        e.target.reset(); // Reset file input
      }

      // Refresh the page to show the new chapter
      router.refresh();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-700">{success}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="chapterNumber" className="block text-sm font-medium text-gray-700">
            Số chương <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="chapterNumber"
            value={formData.chapterNumber}
            onChange={(e) => setFormData({ ...formData, chapterNumber: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
            min="1"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Tiêu đề chương <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          File nội dung (.txt) <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 flex flex-col space-y-2">
          <input
            type="file"
            id="content"
            accept=".txt"
            onChange={handleFileChange}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700"
            required
          />
          {fileName && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{fileName}</span>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Chỉ chấp nhận file .txt, kích thước tối đa 1MB
          </p>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 sm:text-sm"
        >
          {isSubmitting ? 'Đang tải lên...' : 'Đăng tải chương'}
        </button>
      </div>
    </form>
  );
} 