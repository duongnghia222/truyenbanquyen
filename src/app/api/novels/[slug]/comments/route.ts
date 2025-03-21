import { NextRequest, NextResponse } from 'next/server';
import { NovelCommentModel, UserModel, NovelModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';

// Get comments for a specific novel
export const GET = createApiHandler(async (request: NextRequest) => {
  // Extract slug from URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const slug = pathParts[pathParts.length - 2]; // Get the slug from the URL path
  
  // Get URL parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sort = searchParams.get('sort') || 'createdAt'; // Default sort field
  const order = searchParams.get('order') || 'DESC'; // Default order
  const parentId = searchParams.get('parent');
  
  // Find the novel by slug
  const novel = await NovelModel.findBySlug(slug);
  
  if (!novel) {
    return NextResponse.json(
      { error: 'Novel not found' },
      { status: 404 }
    );
  }
  
  // Build query options
  const options = {
    novelId: novel.id,
    parentId: parentId === 'null' ? null : parentId ? parseInt(parentId) : undefined,
    isDeleted: false,
    sortBy: sort,
    order: order as 'ASC' | 'DESC'
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