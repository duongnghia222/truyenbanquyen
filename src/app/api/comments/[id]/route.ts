import { NextRequest, NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { createApiHandler } from '@/lib/api-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import mongoose from 'mongoose';

// Get a single comment by ID
export const GET = createApiHandler(async (request: NextRequest) => {
  // Extract the comment ID from the URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1]; // Get the ID from the URL path
  
  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: 'Invalid comment ID format' },
      { status: 400 }
    );
  }
  
  // Find comment and populate user data
  const comment = await Comment.findById(id)
    .populate({
      path: 'user',
      select: 'username avatar',
      model: User
    })
    .populate({
      path: 'replies',
      match: { isDeleted: false },
      populate: {
        path: 'user',
        select: 'username avatar',
        model: User
      }
    });
  
  if (!comment) {
    return NextResponse.json(
      { error: 'Comment not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(comment);
});

// Update a comment
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: 'Invalid comment ID format' },
      { status: 400 }
    );
  }
  
  // Find the comment
  const comment = await Comment.findById(id);
  
  if (!comment) {
    return NextResponse.json(
      { error: 'Comment not found' },
      { status: 404 }
    );
  }
  
  // Check if user is the comment owner
  if (comment.user.toString() !== session.user.id) {
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
  comment.content = content;
  comment.isEdited = true;
  comment.updatedAt = new Date();
  await comment.save();
  
  // Return updated comment with user data
  const updatedComment = await Comment.findById(id)
    .populate({
      path: 'user',
      select: 'username avatar',
      model: User
    });
  
  return NextResponse.json(updatedComment);
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: 'Invalid comment ID format' },
      { status: 400 }
    );
  }
  
  // Find the comment
  const comment = await Comment.findById(id);
  
  if (!comment) {
    return NextResponse.json(
      { error: 'Comment not found' },
      { status: 404 }
    );
  }
  
  // Check if user is the comment owner or an admin
  const isOwner = comment.user.toString() === session.user.id;
  const isAdmin = session.user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { error: 'You can only delete your own comments' },
      { status: 403 }
    );
  }
  
  // Soft delete the comment
  comment.isDeleted = true;
  comment.content = isAdmin && !isOwner 
    ? 'This comment was removed by an administrator.' 
    : 'This comment was deleted by the user.';
  comment.updatedAt = new Date();
  await comment.save();
  
  return NextResponse.json({ success: true });
}); 