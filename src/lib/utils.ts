export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a date to show time elapsed since that date in Vietnamese
 * @param dateString ISO date string or Date object
 * @returns Formatted string like "1 giờ trước", "2 ngày trước", etc.
 */
export function formatTimeSince(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (seconds < 60) {
    return 'vừa xong';
  }
  
  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} phút trước`;
  }
  
  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} giờ trước`;
  }
  
  // Less than a week
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ngày trước`;
  }
  
  // Less than a month
  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} tuần trước`;
  }
  
  // Less than a year
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} tháng trước`;
  }
  
  // More than a year
  const years = Math.floor(days / 365);
  return `${years} năm trước`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Transliterates Vietnamese characters to their Latin equivalents
 * @param text The text containing Vietnamese characters
 * @returns Text with Vietnamese characters replaced with Latin equivalents
 */
export function transliterateVietnamese(text: string): string {
  const vietnameseChars: Record<string, string> = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'đ': 'd',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y'
  };

  return text.replace(/[^\u0000-\u007E]/g, (char) => {
    const lowerChar = char.toLowerCase();
    return vietnameseChars[lowerChar] || char;
  });
}

/**
 * Generates a URL-friendly slug from a string, properly handling Vietnamese characters
 * @param text The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  // First transliterate Vietnamese characters to Latin equivalents
  const transliterated = transliterateVietnamese(text);
  
  return transliterated
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
} 