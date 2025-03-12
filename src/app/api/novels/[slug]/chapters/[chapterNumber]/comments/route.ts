import { NextRequest, NextResponse } from 'next/server';
import { ChapterComment } from '@/models/Comment';
import User from '@/models/User';
import Novel from '@/models/Novel';
import Chapter from '@/models/Chapter';
import { createApiHandler } from '@/lib/api-utils';
import { FilterQuery } from 'mongoose';

// Get comments for a specific chapter
export const GET = createApiHandler(async (request: NextRequest) => {
  // Extract params from the URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const slug = pathParts[pathParts.indexOf('novels') + 1];
  const chapterNumber = pathParts[pathParts.indexOf('chapters') + 1];
  
  // Get URL parameters
  const { searchParams } = url;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sort = searchParams.get('sort') || '-createdAt'; // Default sort by newest
  const parentId = searchParams.get('parent');
  
  // Validate chapter number
  const chapterNum = parseInt(chapterNumber);
  if (isNaN(chapterNum)) {
    return NextResponse.json(
      { error: 'Invalid chapter number' },
      { status: 400 }
    );
  }
  
  // Find the novel by slug
  const novel = await Novel.findOne({ slug });
  
  if (!novel) {
    return NextResponse.json(
      { error: 'Novel not found' },
      { status: 404 }
    );
  }
  
  // Find the chapter
  const chapter = await Chapter.findOne({
    novelId: novel._id,
    chapterNumber: chapterNum
  });
  
  if (!chapter) {
    return NextResponse.json(
      { error: 'Chapter not found' },
      { status: 404 }
    );
  }
  
  // Build query
  const query: FilterQuery<typeof ChapterComment> = {
    novel: novel._id,
    chapter: chapter._id,
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
        .lean(),
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
        .lean();
      
      // Group replies by parent comment
      const repliesByParent = replies.reduce((acc, reply) => {
        const parentId = reply.parent.toString();
        if (!acc[parentId]) {
          acc[parentId] = [];
        }
        acc[parentId].push(reply);
        return acc;
      }, {} as Record<string, any[]>);
      
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