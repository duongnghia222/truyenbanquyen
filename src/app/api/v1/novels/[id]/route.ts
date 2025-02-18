import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Novel from '@/models/Novel';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    await connectDB();
    const novel = await Novel.findById(params.id);
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(novel);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to fetch novel:', error.message);
    }
    return NextResponse.json(
      { error: 'Failed to fetch novel' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await connectDB();
    const data = await request.json();
    
    const novel = await Novel.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(novel);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to update novel:', error.message);
    }
    return NextResponse.json(
      { error: 'Failed to update novel' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await connectDB();
    const novel = await Novel.findByIdAndDelete(params.id);
    
    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Novel deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to delete novel:', error.message);
    }
    return NextResponse.json(
      { error: 'Failed to delete novel' },
      { status: 500 }
    );
  }
} 