import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Get the token from the request
    const token = req.nextauth?.token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    
    // If user is signed in and tries to access auth pages, redirect to home
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow public access to auth pages
        if (req.nextUrl.pathname.startsWith('/auth')) {
          return true;
        }
        // Require authentication for other protected routes
        return !!token;
      },
    },
  }
);

// Only run middleware on specific paths
export const config = {
  matcher: [
    '/profile/:path*',
    '/bookmark/:path*',
    '/auth/:path*'
  ]
} 