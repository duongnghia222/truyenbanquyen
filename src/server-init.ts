import { initServerEnvironment } from './lib/server-utils';
import { initDatabase } from './lib/db';

// Only run this in a Node.js environment (not Edge runtime)
const nodeEnv = process.env.NODE_ENV || 'development';
console.log('NODE_ENV:', nodeEnv);

// Validate environment variables
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

// Check if we're in production but using development URLs
if (nodeEnv === 'production') {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (appUrl && appUrl.includes('localhost')) {
    console.warn('⚠️ WARNING: Using localhost URL in production environment for NEXT_PUBLIC_APP_URL');
    console.warn('Expected production URL from .env.production, got:', appUrl);
  }
  
  if (apiUrl && apiUrl.includes('localhost')) {
    console.warn('⚠️ WARNING: Using localhost URL in production environment for NEXT_PUBLIC_API_URL');
    console.warn('Expected production URL from .env.production, got:', apiUrl);
  }
}

if (typeof process !== 'undefined' && 
    process.versions != null && 
    process.versions.node != null) {
  
  console.log('Initializing server environment...');
  
  // Initialize server environment (signal handlers, etc.)
  initServerEnvironment();
  
  // Initialize database connection
  initDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
  });
  
  console.log('Server environment initialized');
} 