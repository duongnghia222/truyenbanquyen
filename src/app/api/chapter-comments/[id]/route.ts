import { NextRequest, NextResponse } from 'next/server';
import { CommentModel } from '@/models/postgresql';
import { UserModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// Get a single chapter comment by ID
export const GET = createApiHandler(async (request: NextRequest) => {
  // Extract the comment ID from the URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1]; // Get the ID from the URL path
  
  // Validate ID format
  if (isNaN(Number(id))) {
    return NextResponse.json(
      { error: 'Invalid comment ID format' },
      { status: 400 }
    );
  }
  
  // Find comment
  const comment = await CommentModel.getChapterCommentById(Number(id));
  
  if (!comment) {
    return NextResponse.json(
      { error: 'Comment not found' },
      { status: 404 }
    );
  }
  
  // Get user data
  const user = await UserModel.findById(comment.userId);
  
  // Get replies if any
  const replies = await CommentModel.getChapterCommentReplies(comment.id);
  
  // Format the response
  const formattedComment = {
    ...comment,
    user: user ? {
      id: user.id,
      username: user.username,
      avatar: user.image
    } : null,
    replies: replies
  };
  
  return NextResponse.json(formattedComment);
});

// Update a chapter comment
export const PATCH = createApiHandler(async (request: NextRequest) => {
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
  if (isNaN(Number(id))) {
    return NextResponse.json(
      { error: 'Invalid comment ID format' },
      { status: 400 }
    );
  }
  
  // Find the comment
  const comment = await CommentModel.getChapterCommentById(Number(id));
  
  if (!comment) {
    return NextResponse.json(
      { error: 'Comment not found' },
      { status: 404 }
    );
  }
  
  // Check if user is the comment owner
  if (comment.userId !== Number(session.user.id)) {
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
  const updatedComment = await CommentModel.updateChapterComment(Number(id), content);
  
  if (!updatedComment) {
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
  
  // Get user data
  const user = await UserModel.findById(updatedComment.userId);
  
  // Format the response
  const formattedComment = {
    ...updatedComment,
    user: user ? {
      id: user.id,
      username: user.username,
      avatar: user.image
    } : null
  };
  
  return NextResponse.json(formattedComment);
});

// Delete a chapter comment (soft delete)
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
  if (isNaN(Number(id))) {
    return NextResponse.json(
      { error: 'Invalid comment ID format' },
      { status: 400 }
    );
  }
  
  // Find the comment
  const comment = await CommentModel.getChapterCommentById(Number(id));
  
  if (!comment) {
    return NextResponse.json(
      { error: 'Comment not found' },
      { status: 404 }
    );
  }
  
  // Check if user is the comment owner or an admin
  const isOwner = comment.userId === Number(session.user.id);
  const isAdmin = session.user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { error: 'You can only delete your own comments' },
      { status: 403 }
    );
  }
  
  // Soft delete the comment
  const deleted = await CommentModel.deleteChapterComment(Number(id));
  
  if (!deleted) {
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ success: true });
}); 