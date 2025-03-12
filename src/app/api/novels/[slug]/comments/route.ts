import { NextRequest, NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import User from '@/models/User';
import Novel from '@/models/Novel';
import { createApiHandler } from '@/lib/api-utils';
import { FilterQuery } from 'mongoose';

// Get comments for a specific novel
export const GET = createApiHandler(async (
  request: NextRequest,
  { params }: { params: { slug: string } }
) => {
  const { slug } = params;
  
  // Get URL parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sort = searchParams.get('sort') || '-createdAt'; // Default sort by newest
  const chapterId = searchParams.get('chapter');
  const parentId = searchParams.get('parent');
  
  // Find the novel by slug
  const novel = await Novel.findOne({ slug });
  
  if (!novel) {
    return NextResponse.json(
      { error: 'Novel not found' },
      { status: 404 }
    );
  }
  
  // Build query
  const query: FilterQuery<typeof Comment> = {
    novel: novel._id,
    isDeleted: false
  };
  
  // Add chapter filter if provided
  if (chapterId) {
    query.chapter = chapterId;
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