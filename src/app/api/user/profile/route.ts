import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// Get user profile information
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: 'Bạn cần đăng nhập để thực hiện chức năng này' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Include uploadedNovels in the selection
    const user = await User.findById(session.user.id)
      .select('name username email image uploadedNovels')
      .populate({
        path: 'uploadedNovels',
        select: 'title author coverImage genres status views rating chapterCount createdAt',
        options: { strictPopulate: false }
      });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Không tìm thấy thông tin người dùng' },
        { status: 404 }
      );
    }
    
    // Add uploaderUsername to each novel
    const formattedUser = user.toObject();
    if (Array.isArray(formattedUser.uploadedNovels)) {
      // Using unknown as intermediate step for type assertion
      (formattedUser.uploadedNovels as unknown as Array<{ 
        title: string;
        author: string;
        coverImage: string;
        genres: string[];
        status: string;
        views: number;
        rating: number;
        chapterCount: number;
        createdAt: Date;
        uploaderUsername?: string;
      }>).forEach(novel => {
        novel.uploaderUsername = user.username;
      });
    }
    
    return NextResponse.json({ user: formattedUser });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy thông tin người dùng' },
      { status: 500 }
    );
  }
}

// Update user profile information
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: 'Bạn cần đăng nhập để thực hiện chức năng này' },
        { status: 401 }
      );
    }
    
    const { name, username } = await req.json();
    
    // Validate input
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { message: 'Tên hiển thị không được để trống' },
        { status: 400 }
      );
    }
    
    if (!username || username.trim() === '') {
      return NextResponse.json(
        { message: 'Tên người dùng không được để trống' },
        { status: 400 }
      );
    }
    
    if (username.length < 3) {
      return NextResponse.json(
        { message: 'Tên người dùng phải có ít nhất 3 ký tự' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Check if username is already taken (by another user)
    const existingUser = await User.findOne({ 
      username: username.trim(),
      _id: { $ne: session.user.id } // Exclude current user
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Tên người dùng đã được sử dụng, vui lòng chọn tên khác' },
        { status: 400 }
      );
    }
    
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        name: name.trim(),
        username: username.trim(),
      },
      { new: true }
    ).select('name username email image');
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Không tìm thấy thông tin người dùng' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { message: 'Lỗi khi cập nhật thông tin người dùng' },
      { status: 500 }
    );
  }
} 