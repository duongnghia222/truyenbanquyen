import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { isStaticPath } from './lib/edge-utils';
import { 
  AUTH_ROUTES, 
  isProtectedRoute, 
  isAuthRoute, 
  MIDDLEWARE_MATCHER 
} from './lib/route-config';

// Handle auth redirects and static asset optimization
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Skip auth check for static assets to improve performance
    if (isStaticPath(pathname)) {
      return NextResponse.next();
    }
    
    // Legacy signin URL handling - redirect from legacy to new signin
    if (pathname === AUTH_ROUTES.LEGACY_SIGNIN) {
      const callbackUrl = req.nextUrl.searchParams.get('callbackUrl');
      const redirectUrl = new URL(AUTH_ROUTES.SIGNIN, req.url);
      if (callbackUrl) {
        redirectUrl.searchParams.set('callbackUrl', callbackUrl);
      }
      return NextResponse.redirect(redirectUrl);
    }
    
    // Get the token from the request
    const token = req.nextauth?.token;
    const isAuthPage = isAuthRoute(pathname);
    
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
        if (isAuthRoute(pathname)) {
          return true;
        }
        
        // Protected routes that require authentication
        if (isProtectedRoute(pathname)) {
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
  matcher: MIDDLEWARE_MATCHER,
  // Specify that this middleware should run in Node.js runtime, not Edge
  runtime: 'nodejs'
} 