import { NextRequest, NextResponse } from 'next/server';
import { ChapterComment } from '@/models/Comment';
import { createApiHandler } from '@/lib/api-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import mongoose from 'mongoose';

// Toggle like status for a chapter comment
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: 'Invalid comment ID format' },
      { status: 400 }
    );
  }
  
  // Find the comment
  const comment = await ChapterComment.findById(id);
  
  if (!comment) {
    return NextResponse.json(
      { error: 'Comment not found' },
      { status: 404 }
    );
  }
  
  const userId = session.user.id;
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  // Check if user has already liked the comment
  const userLikedIndex = comment.likes.findIndex(
    (id: mongoose.Types.ObjectId) => id.equals(userObjectId)
  );
  
  // Toggle like status
  if (userLikedIndex === -1) {
    // User hasn't liked the comment yet, add like
    comment.likes.push(userObjectId);
  } else {
    // User already liked the comment, remove like
    comment.likes.splice(userLikedIndex, 1);
  }
  
  // Save the updated comment
  await comment.save();
  
  // Return updated like count and user's like status
  return NextResponse.json({
    likes: comment.likes.length,
    userLiked: userLikedIndex === -1 // Returns true if like was added, false if removed
  });
});

// Get like status and count for a chapter comment
export const GET = createApiHandler(async (request: NextRequest) => {
  // Extract the comment ID from the URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 2]; // Get the ID from the URL path
  
  // Get the authenticated user
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: 'Invalid comment ID format' },
      { status: 400 }
    );
  }
  
  // Find the comment
  const comment = await ChapterComment.findById(id);
  
  if (!comment) {
    return NextResponse.json(
      { error: 'Comment not found' },
      { status: 404 }
    );
  }
  
  // Check if the authenticated user has liked the comment
  let userLiked = false;
  
  if (userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    userLiked = comment.likes.some(
      (id: mongoose.Types.ObjectId) => id.equals(userObjectId)
    );
  }
  
  // Return like count and user's like status
  return NextResponse.json({
    likes: comment.likes.length,
    userLiked
  });
}); 