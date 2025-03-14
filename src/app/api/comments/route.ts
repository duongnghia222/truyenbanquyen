import { NextRequest, NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import User from '@/models/User';
import Novel from '@/models/Novel';
import { FilterQuery } from 'mongoose';
import { createApiHandler } from '@/lib/api-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// Get comments with pagination and filtering
export const GET = createApiHandler(async (request: NextRequest) => {
  // Get URL parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sort = searchParams.get('sort') || '-createdAt'; // Default sort by newest
  const novelId = searchParams.get('novel');
  const chapterId = searchParams.get('chapter');
  const userId = searchParams.get('user');
  const parentId = searchParams.get('parent');
  
  // Build query
  const query: FilterQuery<typeof Comment> = {
    isDeleted: false // Only return non-deleted comments by default
  };
  
  // Add filters
  if (novelId) {
    query.novel = novelId;
  }
  
  if (chapterId) {
    query.chapter = chapterId;
  }
  
  if (userId) {
    query.user = userId;
  }
  
  // Filter by parent (null for top-level comments, or specific parent ID)
  if (parentId === 'null') {
    query.parent = null; // Top-level comments only
  } else if (parentId) {
    query.parent = parentId; // Replies to a specific comment
  }

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Execute query with pagination
  const [commentsData, total] = await Promise.all([
    Comment.find(query)
      .populate({
        path: 'user',
        select: 'username avatar',
        model: User
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments(query)
  ]);

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
});

// Create a new comment
export const POST = createApiHandler(async (request: NextRequest) => {
  // Get the authenticated user
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  const { content, novelId, chapterId, parentId } = body;
  
  // Validate required fields
  if (!content || !novelId) {
    return NextResponse.json(
      { error: 'Content and novel ID are required' },
      { status: 400 }
    );
  }
  
  // Verify novel exists
  const novel = await Novel.findById(novelId);
  if (!novel) {
    return NextResponse.json(
      { error: 'Novel not found' },
      { status: 404 }
    );
  }
  
  // Create comment data
  const commentData = {
    content,
    user: session.user.id,
    novel: novelId,
    chapter: chapterId || null,
    parent: parentId || null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Create new comment
  const comment = await Comment.create(commentData);
  
  // Populate user data for response
  const populatedComment = await Comment.findById(comment._id)
    .populate({
      path: 'user',
      select: 'username avatar',
      model: User
    });
    
  return NextResponse.json(populatedComment, { status: 201 });
}); 