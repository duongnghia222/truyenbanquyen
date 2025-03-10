// Custom server starter that ensures environment variables are loaded
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// First, prepare the environment for production (temporarily rename .env.local)
const { success: prepSuccess } = require('./prepare-production');

if (!prepSuccess) {
  console.error('Failed to prepare environment for production. Exiting...');
  process.exit(1);
}

// Now load production environment variables
const { success, env } = require('./load-production-env');

if (!success) {
  console.error('Failed to load production environment variables. Exiting...');
  process.exit(1);
}

// Display important environment variables
console.log('\n===== PRODUCTION SERVER ENVIRONMENT =====');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
console.log(`NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
console.log('=========================================\n');

// Verify .env.production was loaded
const envProductionPath = path.resolve(process.cwd(), '.env.production');
if (!fs.existsSync(envProductionPath)) {
  console.error(`❌ ERROR: .env.production file not found at ${envProductionPath}`);
  console.error('Please create this file with your production environment variables.');
  process.exit(1);
}

// Verify critical environment variables for production
if (process.env.NODE_ENV === 'production') {
  // Check for localhost URLs in production
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    console.warn('⚠️ WARNING: NEXT_PUBLIC_APP_URL contains localhost in production environment');
  }
  
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    console.warn('⚠️ WARNING: NEXT_PUBLIC_API_URL contains localhost in production environment');
  }
  
  // Check if values match .env.production
  try {
    const envProductionContent = fs.readFileSync(envProductionPath, 'utf8');
    const appUrlMatch = envProductionContent.match(/NEXT_PUBLIC_APP_URL=(.+)/);
    const apiUrlMatch = envProductionContent.match(/NEXT_PUBLIC_API_URL=(.+)/);
    
    if (appUrlMatch && appUrlMatch[1] !== process.env.NEXT_PUBLIC_APP_URL) {
      console.warn(`⚠️ WARNING: NEXT_PUBLIC_APP_URL doesn't match .env.production`);
      console.warn(`  .env.production: ${appUrlMatch[1]}`);
      console.warn(`  Current value: ${process.env.NEXT_PUBLIC_APP_URL}`);
    }
    
    if (apiUrlMatch && apiUrlMatch[1] !== process.env.NEXT_PUBLIC_API_URL) {
      console.warn(`⚠️ WARNING: NEXT_PUBLIC_API_URL doesn't match .env.production`);
      console.warn(`  .env.production: ${apiUrlMatch[1]}`);
      console.warn(`  Current value: ${process.env.NEXT_PUBLIC_API_URL}`);
    }
  } catch (err) {
    console.error('Error reading .env.production file:', err);
  }
}

// Start the Next.js server
const nextBin = path.resolve(process.cwd(), 'node_modules', '.bin', 'next');
const args = ['start', '-H', '0.0.0.0', '-p', '3000'];

console.log(`Executing: ${nextBin} ${args.join(' ')}`);

// Spawn the Next.js process with our loaded environment
const nextProcess = spawn(nextBin, args, {
  stdio: 'inherit',
  env: process.env
});

// Handle process events
nextProcess.on('error', (err) => {
  console.error('Failed to start Next.js server:', err);
  process.exit(1);
});

nextProcess.on('close', (code) => {
  console.log(`Next.js server exited with code ${code}`);
  process.exit(code);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down Next.js server...');
  nextProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down Next.js server...');
  nextProcess.kill('SIGTERM');
}); 