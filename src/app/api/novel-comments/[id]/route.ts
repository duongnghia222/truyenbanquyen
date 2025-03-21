import { NextRequest, NextResponse } from 'next/server';
import { NovelCommentModel, UserModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { NovelComment } from '@/models/postgresql/NovelComment';

// Get a single comment by ID
export const GET = createApiHandler(async (request: NextRequest) => {
  // Extract the comment ID from the URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1]; // Get the ID from the URL path
  
  // Validate ID format
  const commentId = parseInt(id);
  if (isNaN(commentId)) {
    return NextResponse.json(
      { error: 'Invalid comment ID format' },
      { status: 400 }
    );
  }
  
  try {
    // Find comment by ID
    const comment = await NovelCommentModel.getNovelCommentById(commentId);
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Get user data
    const user = await UserModel.findById(comment.userId);
    
    // Add replies if needed
    let replies: Array<NovelComment & { username?: string | null, userAvatar?: string | null }> = [];
    
    // Get replies to this comment
    const repliesResult = await NovelCommentModel.getNovelCommentReplies(commentId);
    if (Array.isArray(repliesResult) && repliesResult.length > 0) {
      // Get all user IDs from replies
      const userIds = repliesResult.map(reply => reply.userId);
      const users = await UserModel.findByIds(userIds);
      
      // Map replies with user data
      replies = repliesResult.map(reply => {
        const replyUser = users.find(u => u.id === reply.userId);
        return {
          ...reply,
          username: replyUser ? replyUser.username : null,
          userAvatar: replyUser ? replyUser.image : null
        };
      });
    }
    
    // Format the response
    const formattedComment = {
      ...comment,
      username: user ? user.username : null,
      userAvatar: user ? user.image : null,
      replies
    };
    
    return NextResponse.json(formattedComment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comment' },
      { status: 500 }
    );
  }
});

// Update a comment
export const PATCH = createApiHandler(async (request: NextRequest) => {
  // Extract the comment ID from the URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1]; // Get the ID from the URL path
  
  // Validate ID format
  const commentId = parseInt(id);
  if (isNaN(commentId)) {
    return NextResponse.json(
      { error: 'Invalid comment ID format' },
      { status: 400 }
    );
  }
  
  // Get the authenticated user
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    // Find the comment
    const comment = await NovelCommentModel.getNovelCommentById(commentId);
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the comment owner
    if (comment.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      );
    }
    
    // Get update data
    const body = await request.json();
    const { content } = body;
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }
    
    // Update the comment
    const updatedComment = await NovelCommentModel.updateNovelComment(commentId, content);
    
    if (!updatedComment) {
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: 500 }
      );
    }
    
    // Get user data
    const user = await UserModel.findById(updatedComment.userId);
    
    // Format response
    const formattedComment = {
      ...updatedComment,
      username: user ? user.username : null,
      userAvatar: user ? user.image : null
    };
    
    return NextResponse.json(formattedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
});

// Delete a comment (soft delete)
export const DELETE = createApiHandler(async (request: NextRequest) => {
  // Extract the comment ID from the URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1]; // Get the ID from the URL path
  
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
  
  try {
    // Find the comment
    const comment = await NovelCommentModel.getNovelCommentById(commentId);
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the comment owner or an admin
    const isOwner = comment.userId === parseInt(session.user.id);
    const isAdmin = session.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }
    
    // Soft delete the comment
    const success = await NovelCommentModel.deleteNovelComment(commentId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}); 