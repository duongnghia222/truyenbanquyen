/**
 * Edge-compatible utilities that don't depend on Node.js-specific modules
 * These utilities can be safely imported in middleware and Edge functions
 */

/**
 * Checks if a path is for a static asset based on file extension
 */
export function isStaticAsset(path: string): boolean {
  const staticExtensions = [
    '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', 
    '.css', '.js', '.woff', '.woff2', '.ttf', '.eot'
  ];
  
  return staticExtensions.some(ext => path.endsWith(ext));
}

/**
 * Checks if a path is for a static resource (including Next.js paths)
 */
export function isStaticPath(path: string): boolean {
  // Static asset check by file extension
  if (isStaticAsset(path)) return true;
  
  // Check for Next.js static paths
  return path.startsWith('/_next/') || 
         path.startsWith('/public/') || 
         path === '/favicon.ico';
} 