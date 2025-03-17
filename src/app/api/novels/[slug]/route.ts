import { NextRequest, NextResponse } from 'next/server';
import { NovelModel, UserModel } from '@/models/postgresql';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createApiHandler } from '@/lib/api-utils';

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
    const novel = await NovelModel.findBySlug(slug);
    
    if (!novel) {
      console.error(`API: Novel with slug ${slug} not found`);
      return handleNotFound();
    }
    
    // Get uploader information
    const uploader = await UserModel.findById(novel.uploadedBy);
    
    // Format the response to include uploader username
    const formattedNovel = {
      ...novel,
      uploaderUsername: uploader ? uploader.username : null
    };
    
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
    const existingNovel = await NovelModel.findBySlug(slug);
    
    if (!existingNovel) return handleNotFound();
    
    // Check if the user is the one who uploaded the novel
    if (existingNovel.uploadedBy !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền cập nhật truyện này' },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    
    // Update the novel
    const novel = await NovelModel.update(existingNovel.id, data);
    
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
    const novel = await NovelModel.findBySlug(slug);
    
    if (!novel) return handleNotFound();
    
    // Check if the user is the one who uploaded the novel
    if (novel.uploadedBy !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xóa truyện này' },
        { status: 403 }
      );
    }
    
    // Delete the novel
    await NovelModel.delete(novel.id);
    
    return NextResponse.json(
      { message: 'Novel deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, 'delete');
  }
}); 