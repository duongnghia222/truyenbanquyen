import { NextRequest, NextResponse } from 'next/server';
import { NovelCommentModel, UserModel, NovelModel } from '@/models/postgresql';
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
  const userId = searchParams.get('user');
  const parentId = searchParams.get('parent');
  
  // Convert MongoDB sort format to PostgreSQL
  const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
  const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';
  
  // Build query options
  const options = {
    novelId: novelId ? (isNaN(parseInt(novelId)) ? undefined : parseInt(novelId)) : undefined,
    userId: userId ? (isNaN(parseInt(userId)) ? undefined : parseInt(userId)) : undefined,
    parentId: parentId === 'null' ? null : parentId ? (isNaN(parseInt(parentId)) ? undefined : parseInt(parentId)) : undefined,
    isDeleted: false,
    sortBy: sortField,
    order: sortOrder as 'ASC' | 'DESC'
  };

  // Execute query with pagination
  const result = await NovelCommentModel.findAll(page, limit, options);
  const { comments, total } = result;

  // Fetch user information for all comments
  const userIds = comments.map(comment => comment.userId);
  const users = await UserModel.findByIds(userIds);

  // Format comments for response
  const formattedComments = comments.map(comment => {
    const user = users.find(u => u.id === comment.userId);
    return {
      ...comment,
      username: user ? user.username : null,
      userAvatar: user ? user.image : null
    };
  });

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return NextResponse.json({
    comments: formattedComments,
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
  const { content, novelId, parentId } = body;
  
  // Validate required fields
  if (!content || !novelId) {
    return NextResponse.json(
      { error: 'Content and novel ID are required' },
      { status: 400 }
    );
  }
  
  // Verify novel exists
  const novelIdInt = isNaN(parseInt(novelId)) ? null : parseInt(novelId);
  if (!novelIdInt) {
    return NextResponse.json(
      { error: 'Invalid novel ID' },
      { status: 400 }
    );
  }
  
  const novel = await NovelModel.findById(novelIdInt);
  if (!novel) {
    return NextResponse.json(
      { error: 'Novel not found' },
      { status: 404 }
    );
  }
  
  // Create comment data
  const commentData = {
    content,
    userId: parseInt(session.user.id),
    novelId: novelIdInt,
    parentId: parentId ? (isNaN(parseInt(parentId)) ? null : parseInt(parentId)) : null
  };
  
  // Create new comment
  const comment = await NovelCommentModel.create(commentData);
  
  // Get user data for response
  const user = await UserModel.findById(parseInt(session.user.id));
  
  // Format response
  const formattedComment = {
    ...comment,
    username: user ? user.username : null,
    userAvatar: user ? user.image : null
  };
    
  return NextResponse.json(formattedComment, { status: 201 });
}); 