export interface Novel {
  _id: string                                   // MongoDB ID
  id?: string                                   // Alternative ID field
  title: string                                 // Novel title
  slug: string                                  // URL-friendly identifier
  author: string                                // Author name
  description: string                           // Novel description
  coverImage: string                            // Cover image URL
  genres: string[]                              // Array of genre names
  status: 'ongoing' | 'completed' | 'hiatus'    // Publication status
  rating: number                                // Average rating
  views: number                                 // View count
  viewCount?: number                            // Alternative view count field
  chapterCount: number                          // Number of chapters
  createdAt: string                             // Creation timestamp
  updatedAt: string                             // Last update timestamp
  lastUpdated?: string                          // Alternative update field
  uploadedBy?: string | object | { _id: string; username?: string }  // User ID or object reference
  uploaderUsername?: string                     // Username of uploader
  contentUrl?: string                           // URL to content (used in some interfaces)
  
  // Optional fields for specific use cases
  badge?: string                                // Featured novel badge
}

// Type alias for novel status
export type NovelStatus = 'ongoing' | 'completed' | 'hiatus';

// Simple novel info (used in chapter context)
export interface NovelInfo {
  _id: string;
  title: string;
  slug: string;
  chapterCount: number;
}

// Chapter interface for novel chapters
export interface Chapter {
  _id: string;                                  // MongoDB ID
  title: string;                                // Chapter title
  novelId?: string;                             // Reference to novel
  chapterNumber: number;                        // Chapter number
  content?: string;                             // Chapter content
  contentUrl?: string;                          // URL to chapter content
  views?: number;                               // Chapter view count
  createdAt: string;                            // Creation timestamp
  updatedAt?: string;                           // Last update timestamp
}

// Response structure for paginated chapter lists
export interface ChaptersResponse {
  chapters: Chapter[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

// Interface for featured novels (used in carousels)
export interface FeaturedNovel {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  badge?: string;
}

// Interface for announcements
export interface Announcement {
  id: string;
  title: string;
  viewCount: number;
  date: string;
  content?: string;
}

// Alias for NovelType (used in some components)
export type NovelType = Novel; 