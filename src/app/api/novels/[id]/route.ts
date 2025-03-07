import { NextResponse } from 'next/server';
import Novel from '@/models/Novel';
import User from '@/models/User';
import { ensureDatabaseConnection } from '@/lib/db';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

type RouteParams = {
  params: Promise<{ id: string }>
};

const handleError = (error: unknown, operation: string) => {
  if (error instanceof Error) {
    console.error(`Failed to ${operation} novel:`, error.message);
  }
  return NextResponse.json(
    { error: `Failed to ${operation} novel` },
    { status: 500 }
  );
};

const handleNotFound = () => {
  return NextResponse.json(
    { error: 'Novel not found' },
    { status: 404 }
  );
};

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    console.log(`API: Fetching novel with ID: ${id}`);
    
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`API: Invalid novel ID format: ${id}`);
      return NextResponse.json(
        { error: 'Invalid novel ID format' },
        { status: 400 }
      );
    }
    
    // Populate the uploader's username
    const novel = await Novel.findById(id)
      .populate({
        path: 'uploadedBy',
        select: 'username',
        model: User
      });
    
    if (!novel) {
      console.error(`API: Novel with ID ${id} not found`);
      return handleNotFound();
    }
    
    // Format the response to include uploader username
    const formattedNovel = novel.toJSON();
    
    // Add uploaderUsername if uploadedBy exists
    if (formattedNovel.uploadedBy && formattedNovel.uploadedBy.username) {
      formattedNovel.uploaderUsername = formattedNovel.uploadedBy.username;
    }
    
    console.log(`API: Successfully fetched novel: ${novel.title}`);
    return NextResponse.json(formattedNovel);
  } catch (error) {
    console.error(`API: Error fetching novel with ID ${id}:`, error);
    return handleError(error, 'fetch');
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để thực hiện chức năng này' },
        { status: 401 }
      );
    }
    
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    // Find the novel first to check ownership
    const existingNovel = await Novel.findById(id);
    
    if (!existingNovel) return handleNotFound();
    
    // Check if the user is the one who uploaded the novel
    if (existingNovel.uploadedBy && existingNovel.uploadedBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Bạn không có quyền cập nhật truyện này' },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    const novel = await Novel.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(novel);
  } catch (error) {
    return handleError(error, 'update');
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để thực hiện chức năng này' },
        { status: 401 }
      );
    }
    
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    // Find the novel first to check ownership
    const novel = await Novel.findById(id);
    
    if (!novel) return handleNotFound();
    
    // Check if the user is the one who uploaded the novel
    if (novel.uploadedBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xóa truyện này' },
        { status: 403 }
      );
    }
    
    // Delete the novel
    await Novel.findByIdAndDelete(id);
    
    // Remove the novel from the user's uploadedNovels array
    await User.findByIdAndUpdate(
      session.user.id,
      { $pull: { uploadedNovels: id } }
    );
    
    return NextResponse.json(
      { message: 'Novel deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, 'delete');
  }
} 