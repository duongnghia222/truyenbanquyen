import { NextRequest, NextResponse } from 'next/server';
import { ChapterCommentModel } from '@/models/postgresql';
import { UserModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

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
  likes?: number[];
  _userLiked?: boolean;
  chapterNumber?: number;
}

// Get novel comments with pagination 
export const GET = createApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters
  const novelId = searchParams.get('novel');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  // Validate required parameters
  if (!novelId) {
    return NextResponse.json(
      { error: 'Novel ID is required' },
      { status: 400 }
    );
  }
  
  // Validate ID formats
  if (isNaN(Number(novelId))) {
    return NextResponse.json(
      { error: 'Invalid ID format' },
      { status: 400 }
    );
  }
  
  try {
    // Get comments for the novel
    const { comments: commentsData, total } = await ChapterCommentModel.getNovelComments(
      Number(novelId),
      page,
      limit
    );
    
    // Create extended comments with user and replies properties
    const extendedComments: ExtendedChapterComment[] = commentsData.map(comment => ({
      ...comment,
      chapterNumber: comment.chapterNumber
    }));
    
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    // Process each comment to add user data and likes
    for (const comment of extendedComments) {
      // Get user data for the comment
      const user = await UserModel.findById(comment.userId);
      if (user) {
        comment.user = {
          id: user.id,
          username: user.username,
          image: user.image
        };
      }
      
      // Get likes for the comment
      const commentLikes = await ChapterCommentModel.getChapterCommentLikes(comment.id);
      comment.likes = commentLikes;
      
      // Check if the current user has liked this comment
      if (session?.user?.id) {
        const userLiked = await ChapterCommentModel.hasUserLikedChapterComment(
          Number(session.user.id),
          comment.id
        );
        comment._userLiked = userLiked;
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
    console.error('Error fetching novel comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}); 