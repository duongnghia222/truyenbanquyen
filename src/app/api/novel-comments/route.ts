import { NextRequest, NextResponse } from 'next/server';
import { NovelCommentModel, UserModel, NovelModel, ChapterCommentModel, ChapterModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// Define extended interfaces to handle combined comment types
interface ExtendedNovelComment {
  id: number;
  content: string;
  userId: number;
  novelId: number;
  parentId?: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  chapterNumber?: number;
  chapterId?: number;
  isChapterComment?: boolean;
}

// Get comments with pagination and filtering
export const GET = createApiHandler(async (request: NextRequest) => {
  // Get URL parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sort = searchParams.get('sort') || 'createdAt'; // Default sort field
  const order = searchParams.get('order') || 'DESC'; // Default order
  const novelId = searchParams.get('novel');
  const userId = searchParams.get('user');
  const parentId = searchParams.get('parent');
  const includeChapterComments = searchParams.get('includeChapterComments') === 'true';
  
  // Get the current authenticated user
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;
  
  // Build query options
  const options = {
    novelId: novelId ? (isNaN(parseInt(novelId)) ? undefined : parseInt(novelId)) : undefined,
    userId: userId ? (isNaN(parseInt(userId)) ? undefined : parseInt(userId)) : undefined,
    parentId: parentId === 'null' ? null : parentId ? (isNaN(parseInt(parentId)) ? undefined : parseInt(parentId)) : undefined,
    sortBy: sort,
    order: order as 'ASC' | 'DESC'
  };

  // Execute query with pagination for novel comments
  const result = await NovelCommentModel.findAll(page, limit, options);
  let { comments, total } = result;

  // Initialize arrays to hold all comments and user IDs
  let allComments: ExtendedNovelComment[] = [...comments];
  let allUserIds = comments.map(comment => comment.userId);
  let totalItems = total;

  // If we need to include chapter comments
  if (includeChapterComments && options.novelId) {
    // Get all chapters for this novel
    const chapters = await ChapterModel.findByNovelId(options.novelId);
    
    // If there are chapters, get comments for each chapter
    if (chapters && chapters.length > 0) {
      // For simplicity in this implementation, we'll just get the first page of comments from each chapter
      // A more complete solution would need pagination across all comments
      for (const chapter of chapters) {
        const chapterCommentsResult = await ChapterCommentModel.getChapterComments(chapter.id, 1, 10);
        const chapterComments = chapterCommentsResult.comments;
        
        // Add chapter number to each comment
        const enhancedChapterComments = chapterComments.map(comment => ({
          ...comment,
          chapterNumber: chapter.chapterNumber,
          chapterId: chapter.id, 
          // Add a flag to identify this as a chapter comment
          isChapterComment: true
        })) as ExtendedNovelComment[];
        
        // Add to our arrays
        allComments = [...allComments, ...enhancedChapterComments];
        allUserIds = [...allUserIds, ...enhancedChapterComments.map(comment => comment.userId)];
        totalItems += chapterCommentsResult.total;
      }

      // Sort all comments by creation date
      allComments.sort((a, b) => {
        if (options.order === 'DESC') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
      });

      // Apply pagination to the combined results
      const startIndex = (page - 1) * limit;
      allComments = allComments.slice(startIndex, startIndex + limit);
    }
  }

  // Fetch user information for all comments
  const users = await UserModel.findByIds(allUserIds);
  
  // Collect all comment ids to fetch likes in bulk
  
  // Format comments for response with likes
  const formattedComments = await Promise.all(allComments.map(async comment => {
    const user = users.find(u => u.id === comment.userId);
    
    // Fetch likes based on comment type
    let likes = [];
    let userLiked = false;

    if (comment.isChapterComment) {
      // This is a chapter comment
      likes = await ChapterCommentModel.getChapterCommentLikes(comment.id);
      if (currentUserId) {
        userLiked = await ChapterCommentModel.hasUserLikedChapterComment(currentUserId, comment.id);
      }
    } else {
      // This is a novel comment
      likes = await NovelCommentModel.getNovelCommentLikes(comment.id);
      if (currentUserId) {
        userLiked = await NovelCommentModel.hasUserLikedNovelComment(currentUserId, comment.id);
      }
    }
    
    return {
      ...comment,
      username: user ? user.username : null,
      userAvatar: user ? user.image : null,
      likes: likes,
      _userLiked: userLiked
    };
  }));

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return NextResponse.json({
    comments: formattedComments,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalItems,
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
    parentId: parentId ? (isNaN(parseInt(parentId)) ? undefined : parseInt(parentId)) : undefined
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