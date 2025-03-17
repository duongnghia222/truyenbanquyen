/**
 * Route configuration for the application
 * Centralizes route definitions to avoid hardcoding paths in middleware and components
 */

// Auth related routes
export const AUTH_ROUTES = {
  SIGNIN: '/auth/signin',
  LEGACY_SIGNIN: '/api/auth/signin',
  BASE_PATH: '/auth',
  API_BASE_PATH: '/api/auth',
};

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  '/profile',
  '/bookmark',
  '/reading-history',
  '/notifications',
  '/novels/upload',
];

// Check if a path is a protected route requiring authentication
export function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
}

// Check if a path is an auth-related route
export function isAuthRoute(path: string): boolean {
  return path.startsWith(AUTH_ROUTES.BASE_PATH) || 
         path.startsWith(AUTH_ROUTES.API_BASE_PATH);
}

// Middleware matcher configuration
export const MIDDLEWARE_MATCHER = [
  // Match all request paths except for the ones starting with Next.js internals
  '/((?!_next/static|_next/image|.+\\..+).*)',
  ...PROTECTED_ROUTES.map(route => `${route}/:path*`),
  `${AUTH_ROUTES.BASE_PATH}/:path*`,
  `${AUTH_ROUTES.API_BASE_PATH}/:path*`,
]; 