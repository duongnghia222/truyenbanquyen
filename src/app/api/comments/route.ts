import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import User from '@/models/User';
import Novel from '@/models/Novel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// Create a new comment
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: 'Bạn cần đăng nhập để thực hiện chức năng này' },
        { status: 401 }
      );
    }
    
    const { content, novelId, parentId } = await req.json();
    
    if (!content || !novelId) {
      return NextResponse.json(
        { message: 'Nội dung và ID truyện là bắt buộc' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Check if novel exists
    const novel = await Novel.findById(novelId);
    if (!novel) {
      return NextResponse.json(
        { message: 'Không tìm thấy truyện' },
        { status: 404 }
      );
    }
    
    // Check if parent comment exists if parentId is provided
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return NextResponse.json(
          { message: 'Không tìm thấy bình luận gốc' },
          { status: 404 }
        );
      }
    }
    
    // Create the comment
    const comment = await Comment.create({
      content,
      user: session.user.id,
      novel: novelId,
      parent: parentId || null,
    });
    
    // Add the comment to user's comments
    await User.findByIdAndUpdate(
      session.user.id,
      { $push: { comments: comment._id } }
    );
    
    // Populate user info for response
    const populatedComment = await Comment.findById(comment._id).populate({
      path: 'user',
      select: 'name username image'
    });
    
    return NextResponse.json({ comment: populatedComment }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { message: 'Lỗi khi tạo bình luận' },
      { status: 500 }
    );
  }
}

// Get comments for a novel
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const novelId = url.searchParams.get('novelId');
    const parentId = url.searchParams.get('parentId') || null;
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    if (!novelId) {
      return NextResponse.json(
        { message: 'ID truyện là bắt buộc' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Check if novel exists
    const novel = await Novel.findById(novelId);
    if (!novel) {
      return NextResponse.json(
        { message: 'Không tìm thấy truyện' },
        { status: 404 }
      );
    }
    
    const skip = (page - 1) * limit;
    
    // Query for comments
    const query = {
      novel: novelId,
      parent: parentId,
      isDeleted: false
    };
    
    const totalComments = await Comment.countDocuments(query);
    
    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'user',
        select: 'name username image'
      });
    
    return NextResponse.json({
      comments,
      pagination: {
        total: totalComments,
        page,
        pages: Math.ceil(totalComments / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy bình luận' },
      { status: 500 }
    );
  }
} 