import { NextRequest, NextResponse } from 'next/server';
import { isStaticAsset } from './edge-utils';

// Import database functions dynamically to avoid Edge Runtime errors
let ensureDatabaseConnection: () => Promise<boolean>;
let dbConnectionInitialized = false;

// Only import database functions in a Node.js environment
if (typeof window === 'undefined') {
  // This code will only run on the server, not in Edge Runtime
  import('./db').then((db) => {
    ensureDatabaseConnection = db.ensureDatabaseConnection;
    dbConnectionInitialized = true;
  }).catch(err => {
    console.error('Failed to import database utilities:', err);
  });
}

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
  
  if (isApiRoute && ensureDatabaseConnection && dbConnectionInitialized) {
    try {
      // Ensure database connection for API routes
      // Use a short timeout to prevent hanging requests
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Database connection timeout')), 3000);
      });
      
      // Race the connection promise with a timeout
      await Promise.race([
        ensureDatabaseConnection(),
        timeoutPromise
      ]).catch(error => {
        // Log error but continue with handler
        console.error('Database connection error or timeout:', error);
      });
    } catch (error) {
      // Log error but continue with handler
      console.error('Database connection error:', error);
    }
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