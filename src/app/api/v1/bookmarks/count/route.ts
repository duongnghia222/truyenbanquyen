import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ count: 0 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ count: 0 });
    }

    const bookmarkCount = user.bookmarks?.length || 0;
    return NextResponse.json({ count: bookmarkCount });
  } catch (error) {
    console.error('Failed to fetch bookmark count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmark count' },
      { status: 500 }
    );
  }
} 