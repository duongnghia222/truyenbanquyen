import { NextRequest, NextResponse } from 'next/server';
import { CommentModel } from '@/models/postgresql';
import { UserModel } from '@/models/postgresql';
import { NovelModel } from '@/models/postgresql';
import { ChapterModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { ChapterComment } from '@/models/postgresql';

// Define interfaces for comment data
interface CommentUser {
  id: number;
  username: string;
  image?: string;
}

interface ExtendedChapterComment extends ChapterComment {
  user?: CommentUser;
  replies?: ExtendedChapterComment[];
}

// Get chapter comments with pagination and filtering
export const GET = createApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters
  const novelId = searchParams.get('novel');
  const chapterId = searchParams.get('chapter');
  const parentId = searchParams.get('parent');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  // Validate required parameters
  if (!novelId || !chapterId) {
    return NextResponse.json(
      { error: 'Novel ID and Chapter ID are required' },
      { status: 400 }
    );
  }
  
  // Validate ID formats
  if (isNaN(Number(novelId)) || isNaN(Number(chapterId))) {
    return NextResponse.json(
      { error: 'Invalid ID format' },
      { status: 400 }
    );
  }
  
  try {
    // Get comments for the chapter
    const { comments: commentsData, total } = await CommentModel.getChapterComments(
      Number(chapterId),
      page,
      limit
    );
    
    // Create extended comments with user and replies properties
    const extendedComments: ExtendedChapterComment[] = commentsData.map(comment => ({
      ...comment
    }));
    
    // For top-level comments, fetch their replies
    if (parentId === 'null' || !parentId) {
      // Process each comment to add replies
      for (const comment of extendedComments) {
        // Get replies for this comment
        const replies = await CommentModel.getChapterCommentReplies(comment.id);
        
        // Create extended replies with user property
        const extendedReplies: ExtendedChapterComment[] = replies.map(reply => ({
          ...reply
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

// Create a new chapter comment
export const POST = createApiHandler(async (request: NextRequest) => {
  // Get the authenticated user
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    // Parse request body
    const body = await request.json() as {
      content: string;
      novelId: string;
      chapterId: string;
      parentId?: string;
    };
    
    const { content, novelId, chapterId, parentId } = body;
    
    // Validate required fields
    if (!content || !novelId || !chapterId) {
      return NextResponse.json(
        { error: 'Content, novel ID, and chapter ID are required' },
        { status: 400 }
      );
    }
    
    // Validate content length
    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be less than 1000 characters' },
        { status: 400 }
      );
    }
    
    // Validate ID formats
    if (isNaN(Number(novelId)) || isNaN(Number(chapterId))) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Validate parent ID if provided
    if (parentId && isNaN(Number(parentId))) {
      return NextResponse.json(
        { error: 'Invalid parent comment ID format' },
        { status: 400 }
      );
    }
    
    // Verify that the novel and chapter exist
    const novel = await NovelModel.findById(Number(novelId));
    const chapter = await ChapterModel.findById(Number(chapterId));
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      );
    }
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    // Verify that the chapter belongs to the novel
    if (chapter.novelId !== Number(novelId)) {
      return NextResponse.json(
        { error: 'Chapter does not belong to the specified novel' },
        { status: 400 }
      );
    }
    
    // If this is a reply, verify that the parent comment exists
    if (parentId) {
      const parentComment = await CommentModel.getChapterCommentById(Number(parentId));
      
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
      
      // Verify that the parent comment belongs to the same novel and chapter
      if (parentComment.novelId !== Number(novelId) || parentComment.chapterId !== Number(chapterId)) {
        return NextResponse.json(
          { error: 'Parent comment does not belong to the specified novel and chapter' },
          { status: 400 }
        );
      }
      
      // Verify that the parent comment is not a reply itself (only one level of nesting)
      if (parentComment.parentId) {
        return NextResponse.json(
          { error: 'Cannot reply to a reply' },
          { status: 400 }
        );
      }
    }
    
    // Create the new comment
    const newComment = await CommentModel.createChapterComment({
      content,
      userId: Number(session.user.id),
      novelId: Number(novelId),
      chapterId: Number(chapterId),
      parentId: parentId ? Number(parentId) : undefined
    });
    
    // Get user data for the response
    const user = await UserModel.findById(newComment.userId);
    
    // Format the comment for response
    const formattedComment: ExtendedChapterComment = {
      ...newComment,
      user: user ? {
        id: user.id,
        username: user.username,
        image: user.image
      } : undefined
    };
    
    return NextResponse.json(formattedComment);
  } catch (error) {
    console.error('Error creating chapter comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}); 