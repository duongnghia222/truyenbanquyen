import { NextResponse } from 'next/server';
import Novel from '@/models/Novel';
import { ensureDatabaseConnection } from '@/lib/db';
import mongoose from 'mongoose';

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
    
    const novel = await Novel.findById(id);
    
    if (!novel) {
      console.error(`API: Novel with ID ${id} not found`);
      return handleNotFound();
    }
    
    console.log(`API: Successfully fetched novel: ${novel.title}`);
    return NextResponse.json(novel);
  } catch (error) {
    console.error(`API: Error fetching novel with ID ${id}:`, error);
    return handleError(error, 'fetch');
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    const data = await request.json();
    const novel = await Novel.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!novel) return handleNotFound();
    return NextResponse.json(novel);
  } catch (error) {
    return handleError(error, 'update');
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    const novel = await Novel.findByIdAndDelete(id);
    if (!novel) return handleNotFound();
    
    return NextResponse.json(
      { message: 'Novel deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, 'delete');
  }
} 