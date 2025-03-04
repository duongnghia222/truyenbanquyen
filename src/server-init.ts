import { initServerEnvironment } from './lib/server-utils';
import { initDatabase } from './lib/db';

// Only run this in a Node.js environment (not Edge runtime)
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