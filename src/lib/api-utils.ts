import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseConnection, isStaticAsset } from './db';

/**
 * A wrapper for API route handlers that ensures database connection
 * but skips it for static assets to improve performance.
 * This is Edge-compatible and avoids Node.js specific APIs.
 */
export async function withDatabase<T>(
  req: NextRequest,
  handler: () => Promise<T>
): Promise<T> {
  // Skip database connection for static assets
  const url = new URL(req.url);
  if (isStaticAsset(url.pathname)) {
    return handler();
  }
  
  // Check if URL is for an API route that requires database
  const isApiRoute = url.pathname.startsWith('/api/');
  
  if (isApiRoute) {
    // Ensure database connection for API routes
    await ensureDatabaseConnection();
  }
  
  return handler();
}

/**
 * Creates an API route handler with database connection handling
 * that is Edge-compatible.
 */
export function createApiHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async function(req: NextRequest): Promise<NextResponse> {
    try {
      return await withDatabase(req, () => handler(req));
    } catch (error) {
      console.error('API error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
} 