import { NextResponse } from 'next/server';
import Novel from '@/models/Novel';

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
    const novel = await Novel.findById(id);
    if (!novel) return handleNotFound();
    return NextResponse.json(novel);
  } catch (error) {
    return handleError(error, 'fetch');
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
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