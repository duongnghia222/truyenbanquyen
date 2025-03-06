'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, FileText, Info } from 'lucide-react';

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
    chapterNumber: '',
    summary: '' // New field for chapter summary
  });
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);

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

    // Preview the file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  const togglePreview = () => {
    setPreviewVisible(!previewVisible);
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

      const uploadResponse = await fetch(`/api/novels/${novelId}/chapters/upload/content`, {
        method: 'POST',
        body: contentFormData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Không thể tải lên file nội dung');
      }

      // Then create the chapter with the content URL
      const response = await fetch(`/api/novels/${novelId}/chapters/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          chapterNumber: parseInt(formData.chapterNumber),
          contentUrl: uploadData.contentUrl,
          summary: formData.summary || null
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
        chapterNumber: '',
        summary: ''
      });
      setContentFile(null);
      setFileName('');
      setFileContent('');
      setPreviewVisible(false);
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
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-700">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
            <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
            <div className="text-sm text-green-700 dark:text-green-200">{success}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="chapterNumber" className="block text-base font-semibold text-gray-800 dark:text-white">
            Số chương <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="chapterNumber"
              value={formData.chapterNumber}
              onChange={(e) => setFormData({ ...formData, chapterNumber: e.target.value })}
              className="block w-full rounded-lg border border-gray-200 dark:border-gray-700 
                !bg-white !dark:bg-gray-900 !text-gray-900 !dark:text-white
                px-4 py-3 shadow-sm
                focus:border-blue-500 dark:focus:border-blue-400 
                focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
                placeholder:text-gray-400 dark:placeholder:text-gray-500"
              required
              min="1"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
              Nhập số thứ tự của chương, ví dụ: 1, 2, 3,...
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-base font-semibold text-gray-800 dark:text-white">
            Tiêu đề chương <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="block w-full rounded-lg border border-gray-200 dark:border-gray-700 
                !bg-white !dark:bg-gray-900 !text-gray-900 !dark:text-white
                px-4 py-3 shadow-sm
                focus:border-blue-500 dark:focus:border-blue-400 
                focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
                placeholder:text-gray-400 dark:placeholder:text-gray-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
              Nhập tiêu đề của chương, ví dụ: &ldquo;Khởi Đầu&rdquo;, &ldquo;Gặp Gỡ&rdquo;,...
            </p>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="summary" className="block text-base font-semibold text-gray-800 dark:text-white">
          Tóm tắt chương
        </label>
        <div className="mt-1">
          <textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            rows={3}
            className="block w-full rounded-lg border border-gray-200 dark:border-gray-700 
              !bg-white !dark:bg-gray-900 !text-gray-900 !dark:text-white
              px-4 py-3 shadow-sm
              focus:border-blue-500 dark:focus:border-blue-400 
              focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
              placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="Nhập tóm tắt ngắn về nội dung chương (không bắt buộc)"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
            Tóm tắt ngắn gọn nội dung chương để thu hút độc giả (không quá 200 từ)
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-base font-semibold text-gray-800 dark:text-white">
          File nội dung (.txt) <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <div className="mt-1 flex flex-col space-y-2">
          <div className="flex items-center">
            <input
              type="file"
              id="content"
              accept=".txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 dark:text-gray-300
                file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0
                file:text-sm file:font-medium 
                file:bg-blue-50 dark:file:bg-blue-900/30
                file:text-blue-700 dark:file:text-blue-300
                hover:file:bg-blue-100 dark:hover:file:bg-blue-900/40
                file:transition-all file:duration-200
                !bg-white !dark:bg-gray-900"
              required
            />
          </div>
          
          {fileName && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <FileText className="w-4 h-4" />
              <span>{fileName}</span>
              {fileContent && (
                <button 
                  type="button" 
                  onClick={togglePreview} 
                  className="ml-2 text-blue-600 dark:text-blue-300 hover:underline text-xs"
                >
                  {previewVisible ? 'Ẩn xem trước' : 'Xem trước'}
                </button>
              )}
            </div>
          )}
          
          {previewVisible && fileContent && (
            <div className="mt-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800/60">
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Xem trước nội dung:</h4>
              <div className="max-h-60 overflow-y-auto text-xs whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-200 p-2 bg-white dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-700">
                {fileContent.length > 1000 
                  ? fileContent.substring(0, 1000) + '...' 
                  : fileContent
                }
              </div>
              {fileContent.length > 1000 && (
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                  Nội dung đã được cắt ngắn. Chỉ hiển thị 1000 ký tự đầu tiên.
                </p>
              )}
            </div>
          )}
          
          <div className="flex items-start space-x-2 text-sm text-gray-500 dark:text-gray-300">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
            <div>
              <p>Chỉ chấp nhận file .txt, kích thước tối đa 1MB</p>
              <p>Đảm bảo nội dung của bạn đã được kiểm tra lỗi chính tả trước khi tải lên</p>
              <p>Nếu file không hiển thị đúng tiếng Việt, hãy đảm bảo mã hóa UTF-8</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full justify-center rounded-md border border-transparent 
                  bg-blue-600 dark:bg-blue-700 px-4 py-2 text-base font-medium text-white 
                  shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                  disabled:opacity-50 transition-colors sm:text-sm"
        >
          {isSubmitting ? 'Đang tải lên...' : 'Đăng tải chương'}
        </button>
      </div>
    </form>
  );
} 