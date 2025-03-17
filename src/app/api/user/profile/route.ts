import { NextResponse } from 'next/server';
import { UserModel, NovelModel } from '@/models/postgresql';
import { createApiHandler } from '@/lib/api-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// Get user profile information
export const GET = createApiHandler(async () => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: 'Bạn cần đăng nhập để thực hiện chức năng này' },
        { status: 401 }
      );
    }
    
    // Get user data
    const userId = parseInt(session.user.id);
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Không tìm thấy thông tin người dùng' },
        { status: 404 }
      );
    }
    
    // Get user's uploaded novels
    const result = await NovelModel.findByUploader(userId);
    const novels = result.novels;
    
    // Format user data for response
    const formattedUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      image: user.image,
      uploadedNovels: novels.map((novel: { id: number; title: string; slug: string; coverImage: string; status: string }) => ({
        ...novel,
        uploaderUsername: user.username
      }))
    };
    
    return NextResponse.json({ user: formattedUser });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy thông tin người dùng' },
      { status: 500 }
    );
  }
});

// Update user profile information
export const PUT = createApiHandler(async (req: Request) => {
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
    
    const userId = parseInt(session.user.id);
    
    // Check if username is already taken (by another user)
    const existingUser = await UserModel.findByUsername(username.trim());
    
    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { message: 'Tên người dùng đã được sử dụng, vui lòng chọn tên khác' },
        { status: 400 }
      );
    }
    
    // Update user profile
    const updatedUser = await UserModel.update(userId, {
      name: name.trim(),
      username: username.trim()
    });
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Không tìm thấy thông tin người dùng' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        image: updatedUser.image
      }
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { message: 'Lỗi khi cập nhật thông tin người dùng' },
      { status: 500 }
    );
  }
}); 