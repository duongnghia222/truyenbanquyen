import { NextRequest, NextResponse } from 'next/server';
import { ChapterCommentModel } from '@/models/postgresql';
import { UserModel } from '@/models/postgresql';
import { NovelModel } from '@/models/postgresql';
import { ChapterModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';
import type { ChapterComment } from '@/models/postgresql';

// Define interfaces for comment data
interface CommentUser {
  id: number;
  username: string;
  image?: string;
}

// Extended interface with additional fields
interface ExtendedChapterComment {
  id: number;
  content: string;
  userId: number;
  novelId: number;
  chapterId: number;
  parentId?: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: CommentUser;
  replies?: ExtendedChapterComment[];
}

// Get comments for a specific chapter
export const GET = createApiHandler(async (request: NextRequest) => {
  // Extract params from the URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const slug = pathParts[pathParts.indexOf('novels') + 1];
  const chapterNumber = pathParts[pathParts.indexOf('chapters') + 1];
  
  // Get URL parameters
  const { searchParams } = url;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const parentId = searchParams.get('parent');
  
  // Validate chapter number
  const chapterNum = parseInt(chapterNumber);
  if (isNaN(chapterNum)) {
    return NextResponse.json(
      { error: 'Invalid chapter number' },
      { status: 400 }
    );
  }
  
  // Find the novel by slug
  const novel = await NovelModel.findBySlug(slug);
  
  if (!novel) {
    return NextResponse.json(
      { error: 'Novel not found' },
      { status: 404 }
    );
  }
  
  // Find the chapter
  const chapter = await ChapterModel.findByNovelIdAndChapterNumber(novel.id, chapterNum);
  
  if (!chapter) {
    return NextResponse.json(
      { error: 'Chapter not found' },
      { status: 404 }
    );
  }
  
  try {
    // Get comments for the chapter
    const { comments: commentsData, total } = await ChapterCommentModel.getChapterComments(
      chapter.id,
      page,
      limit
    );
    
    // Create extended comments with user and replies properties
    const extendedComments: ExtendedChapterComment[] = commentsData.map(comment => ({
      ...comment,
      user: undefined,
      replies: []
    }));
    
    // For top-level comments, fetch their replies
    if (parentId === 'null' || !parentId) {
      // Process each comment to add replies
      for (const comment of extendedComments) {
        // Get replies for this comment
        const replies = await ChapterCommentModel.getChapterCommentReplies(comment.id);
        
        // Create extended replies with user property
        const extendedReplies: ExtendedChapterComment[] = replies.map(reply => ({
          ...reply,
          user: undefined,
          replies: []
        }));
        
        // Add replies to the comment
        comment.replies = extendedReplies;
        
        // Get user data for the comment
        const user = await UserModel.findById(comment.userId);
        if (user) {
          comment.user = {
            id: user.id,
            username: user.username,
            image: user.image
          };
        }
        
        // Get user data for each reply
        for (const reply of extendedReplies) {
          const replyUser = await UserModel.findById(reply.userId);
          if (replyUser) {
            reply.user = {
              id: replyUser.id,
              username: replyUser.username,
              image: replyUser.image
            };
          }
        }
      }
    }
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      comments: extendedComments,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching chapter comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}); 