import { NextRequest, NextResponse } from 'next/server';
import { ChapterComment } from '@/models/Comment';
import User from '@/models/User';
import Novel from '@/models/Novel';
import Chapter from '@/models/Chapter';
import { createApiHandler } from '@/lib/api-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import mongoose from 'mongoose';
import { FilterQuery } from 'mongoose';

// Define interfaces for comment data
interface CommentUser {
  _id: string;
  username: string;
  avatar?: string;
}

interface CommentData {
  _id: mongoose.Types.ObjectId;
  content: string;
  user: CommentUser;
  novel: mongoose.Types.ObjectId;
  chapter: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies?: CommentData[];
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
  const sort = searchParams.get('sort') || '-createdAt'; // Default sort by newest
  
  // Validate required parameters
  if (!novelId || !chapterId) {
    return NextResponse.json(
      { error: 'Novel ID and Chapter ID are required' },
      { status: 400 }
    );
  }
  
  // Validate ID formats
  if (!mongoose.Types.ObjectId.isValid(novelId) || !mongoose.Types.ObjectId.isValid(chapterId)) {
    return NextResponse.json(
      { error: 'Invalid ID format' },
      { status: 400 }
    );
  }
  
  // Build query
  const query: FilterQuery<typeof ChapterComment> = {
    novel: novelId,
    chapter: chapterId,
    isDeleted: false
  };
  
  // Filter by parent (null for top-level comments, or specific parent ID)
  if (parentId === 'null') {
    query.parent = null; // Top-level comments only
  } else if (parentId) {
    query.parent = parentId; // Replies to a specific comment
  }
  
  // Calculate skip value for pagination
  const skip = (page - 1) * limit;
  
  try {
    // Execute query with pagination
    const [commentsData, total] = await Promise.all([
      ChapterComment.find(query)
        .populate({
          path: 'user',
          select: 'username avatar',
          model: User
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean<CommentData[]>(),
      ChapterComment.countDocuments(query)
    ]);
    
    // For top-level comments, fetch their replies
    if (parentId === 'null' || !parentId) {
      // Get all comment IDs
      const commentIds = commentsData.map(comment => comment._id);
      
      // Fetch all replies for these comments
      const replies = await ChapterComment.find({
        parent: { $in: commentIds },
        isDeleted: false
      })
        .populate({
          path: 'user',
          select: 'username avatar',
          model: User
        })
        .sort('-createdAt')
        .lean<CommentData[]>();
      
      // Group replies by parent comment
      const repliesByParent = replies.reduce((acc, reply) => {
        const parentId = reply.parent?.toString() || '';
        if (!acc[parentId]) {
          acc[parentId] = [];
        }
        acc[parentId].push(reply);
        return acc;
      }, {} as Record<string, CommentData[]>);
      
      // Add replies to their parent comments
      commentsData.forEach(comment => {
        const commentId = comment._id.toString();
        comment.replies = repliesByParent[commentId] || [];
      });
    }
    
    // Format comments for response
    const comments = commentsData.map(comment => {
      const formattedComment = { ...comment };
      if (comment.user) {
        formattedComment.username = comment.user.username;
        formattedComment.userAvatar = comment.user.avatar;
      }
      return formattedComment;
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      comments,
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
    if (!mongoose.Types.ObjectId.isValid(novelId) || !mongoose.Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Validate parent ID if provided
    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      return NextResponse.json(
        { error: 'Invalid parent comment ID format' },
        { status: 400 }
      );
    }
    
    // Verify that the novel and chapter exist
    const [novel, chapter] = await Promise.all([
      Novel.findById(novelId),
      Chapter.findById(chapterId)
    ]);
    
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
    if (chapter.novelId.toString() !== novelId) {
      return NextResponse.json(
        { error: 'Chapter does not belong to the specified novel' },
        { status: 400 }
      );
    }
    
    // If this is a reply, verify that the parent comment exists
    if (parentId) {
      const parentComment = await ChapterComment.findById(parentId);
      
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
      
      // Verify that the parent comment belongs to the same novel and chapter
      if (parentComment.novel.toString() !== novelId || parentComment.chapter.toString() !== chapterId) {
        return NextResponse.json(
          { error: 'Parent comment does not belong to the specified novel and chapter' },
          { status: 400 }
        );
      }
      
      // Verify that the parent comment is not a reply itself (only one level of nesting)
      if (parentComment.parent) {
        return NextResponse.json(
          { error: 'Cannot reply to a reply' },
          { status: 400 }
        );
      }
    }
    
    // Create the new comment
    const newComment = new ChapterComment({
      content,
      user: session.user.id,
      novel: novelId,
      chapter: chapterId,
      parent: parentId || null,
      likes: [],
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Save the comment
    await newComment.save();
    
    // Populate user data for the response
    const populatedComment = await ChapterComment.findById(newComment._id)
      .populate({
        path: 'user',
        select: 'username avatar',
        model: User
      });
    
    // Format the comment for response
    const formattedComment = populatedComment?.toObject();
    if (formattedComment && formattedComment.user) {
      formattedComment.username = formattedComment.user.username;
      formattedComment.userAvatar = formattedComment.user.avatar;
    }
    
    return NextResponse.json(formattedComment);
  } catch (error) {
    console.error('Error creating chapter comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}); 