import { NextRequest, NextResponse } from 'next/server';
import Novel from '@/models/Novel';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createApiHandler } from '@/lib/api-utils';

type RouteParams = {
  params: { slug: string }
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

// Use createApiHandler to handle database connections automatically
export const GET = createApiHandler(async (request: NextRequest) => {
  // Extract slug from URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const slug = pathParts[pathParts.length - 1];
  
  try {
    console.log(`API: Fetching novel with slug: ${slug}`);
    
    // Find novel by slug
    const novel = await Novel.findOne({ slug })
      .populate({
        path: 'uploadedBy',
        select: 'username',
        model: User
      });
    
    if (!novel) {
      console.error(`API: Novel with slug ${slug} not found`);
      return handleNotFound();
    }
    
    // Format the response to include uploader username
    const formattedNovel = novel.toJSON();
    
    // Add uploaderUsername if uploadedBy exists
    if (formattedNovel.uploadedBy && typeof formattedNovel.uploadedBy === 'object' && 
        'username' in formattedNovel.uploadedBy && formattedNovel.uploadedBy.username) {
      // Use type assertion to handle the dynamic property
      (formattedNovel as any).uploaderUsername = formattedNovel.uploadedBy.username;
    }
    
    console.log(`API: Successfully fetched novel: ${novel.title}`);
    return NextResponse.json(formattedNovel);
  } catch (error) {
    console.error(`API: Error fetching novel with slug ${slug}:`, error);
    return handleError(error, 'fetch');
  }
});

// Use createApiHandler for PATCH method
export const PATCH = createApiHandler(async (request: NextRequest) => {
  // Extract slug from URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const slug = pathParts[pathParts.length - 1];
  
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để thực hiện chức năng này' },
        { status: 401 }
      );
    }
    
    // Find the novel first to check ownership
    const existingNovel = await Novel.findOne({ slug });
    
    if (!existingNovel) return handleNotFound();
    
    // Check if the user is the one who uploaded the novel
    if (existingNovel.uploadedBy && existingNovel.uploadedBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Bạn không có quyền cập nhật truyện này' },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    
    // If title is being updated, generate a new slug
    if (data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
    
    const novel = await Novel.findOneAndUpdate(
      { slug },
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(novel);
  } catch (error) {
    return handleError(error, 'update');
  }
});

// Use createApiHandler for DELETE method
export const DELETE = createApiHandler(async (request: NextRequest) => {
  // Extract slug from URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const slug = pathParts[pathParts.length - 1];
  
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để thực hiện chức năng này' },
        { status: 401 }
      );
    }
    
    // Find the novel first to check ownership
    const novel = await Novel.findOne({ slug });
    
    if (!novel) return handleNotFound();
    
    // Check if the user is the one who uploaded the novel
    if (novel.uploadedBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xóa truyện này' },
        { status: 403 }
      );
    }
    
    // Delete the novel
    await Novel.findOneAndDelete({ slug });
    
    // Remove the novel from the user's uploadedNovels array
    await User.findByIdAndUpdate(
      session.user.id,
      { $pull: { uploadedNovels: novel._id } }
    );
    
    return NextResponse.json(
      { message: 'Novel deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, 'delete');
  }
}); 