import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import Novel from '@/models/Novel';
import { ensureDatabaseConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // Get the novel ID from the query params
    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get('novelId');
    
    if (!novelId) {
      return NextResponse.json(
        { error: 'Novel ID is required' },
        { status: 400 }
      );
    }
    
    // Ensure database connection
    await ensureDatabaseConnection();
    
    // Get the novel
    const novel = await Novel.findById(novelId);
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      );
    }
    
    // Check ownership details
    const userId = session.user.id.toString();
    const novelUploaderRaw = novel.uploadedBy;
    let novelUploaderId;
    
    if (typeof novelUploaderRaw === 'string') {
      novelUploaderId = novelUploaderRaw;
    } else if (novelUploaderRaw && typeof novelUploaderRaw === 'object') {
      novelUploaderId = novelUploaderRaw.toString();
    }
    
    // Return detailed debug info
    return NextResponse.json({
      success: true,
      isOwner: userId === novelUploaderId,
      details: {
        userId,
        userIdType: typeof userId,
        novelUploaderId,
        novelUploaderIdType: typeof novelUploaderId,
        novelUploaderRaw,
        novelUploaderRawType: typeof novelUploaderRaw,
        match: userId === novelUploaderId
      }
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 