import { NextRequest, NextResponse } from 'next/server';
import { CommentModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// Toggle like status for a comment
export const POST = createApiHandler(async (request: NextRequest) => {
  // Extract the comment ID from the URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 2]; // Get the ID from the URL path
  
  // Get the authenticated user
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Validate ID format
  const commentId = parseInt(id);
  if (isNaN(commentId)) {
    return NextResponse.json(
      { error: 'Invalid comment ID format' },
      { status: 400 }
    );
  }
  
  // Get the user ID
  const userId = parseInt(session.user.id);
  
  try {
    // Check if user has already liked the comment
    const alreadyLiked = await CommentModel.hasUserLikedNovelComment(userId, commentId);
    
    let userLiked;
    if (alreadyLiked) {
      // If already liked, unlike it
      await CommentModel.unlikeNovelComment(userId, commentId);
      userLiked = false;
    } else {
      // If not liked, like it
      await CommentModel.likeNovelComment(userId, commentId);
      userLiked = true;
    }
    
    // Get updated likes count
    const likes = await CommentModel.getNovelCommentLikes(commentId);
    
    // Return updated like count and user's like status
    return NextResponse.json({
      likes: likes.length,
      userLiked
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return NextResponse.json(
      { error: 'Failed to update like status' },
      { status: 500 }
    );
  }
});

// Get like status and count for a comment
export const GET = createApiHandler(async (request: NextRequest) => {
  // Extract the comment ID from the URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 2]; // Get the ID from the URL path
  
  // Get the authenticated user
  const session = await getServerSession(authOptions);
  
  // Validate ID format
  const commentId = parseInt(id);
  if (isNaN(commentId)) {
    return NextResponse.json(
      { error: 'Invalid comment ID format' },
      { status: 400 }
    );
  }
  
  try {
    // Get likes for the comment
    const likes = await CommentModel.getNovelCommentLikes(commentId);
    
    // Check if the authenticated user has liked the comment
    let userLiked = false;
    
    if (session?.user?.id) {
      const userId = parseInt(session.user.id);
      userLiked = await CommentModel.hasUserLikedNovelComment(userId, commentId);
    }
    
    // Return like count and user's like status
    return NextResponse.json({
      likes: likes.length,
      userLiked
    });
  } catch (error) {
    console.error('Error getting comment likes:', error);
    return NextResponse.json(
      { error: 'Failed to get like status' },
      { status: 500 }
    );
  }
}); 