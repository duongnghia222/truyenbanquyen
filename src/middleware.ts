import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { isStaticPath } from './lib/edge-utils';

// Handle auth redirects and static asset optimization
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Skip auth check for static assets to improve performance
    if (isStaticPath(pathname)) {
      return NextResponse.next();
    }
    
    // Legacy signin URL handling - redirect /api/auth/signin to /auth/signin
    if (pathname === '/api/auth/signin') {
      const callbackUrl = req.nextUrl.searchParams.get('callbackUrl');
      const redirectUrl = new URL('/auth/signin', req.url);
      if (callbackUrl) {
        redirectUrl.searchParams.set('callbackUrl', callbackUrl);
      }
      return NextResponse.redirect(redirectUrl);
    }
    
    // Get the token from the request
    const token = req.nextauth?.token;
    const isAuthPage = pathname.startsWith('/auth');
    
    // If user is signed in and tries to access auth pages, redirect to home
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        
        // Skip auth check for static assets
        if (isStaticPath(pathname)) {
          return true;
        }
        
        // Allow public access to auth pages
        if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
          return true;
        }
        
        // Protected routes that require authentication
        if (
          pathname.startsWith('/profile') || 
          pathname.startsWith('/bookmark') || 
          pathname.startsWith('/reading-history') ||
          pathname.startsWith('/notifications') ||
          pathname.startsWith('/novels/upload')
        ) {
          return !!token;
        }
        
        // Allow access to all other routes
        return true;
      },
    },
  }
);

// Update matcher to include auth routes and exclude static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next (Next.js internals)
     * - public folder (static assets)
     * - favicon.ico (legacy browser support)
     */
    '/((?!_next/static|_next/image|.+\\..+).*)',
    '/profile/:path*',
    '/bookmark/:path*',
    '/auth/:path*',
    '/api/auth/:path*',
    '/reading-history/:path*',
    '/notifications/:path*',
    '/novels/upload/:path*'
  ],
  // Specify that this middleware should run in Node.js runtime, not Edge
  runtime: 'nodejs'
} 