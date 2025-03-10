// Comprehensive production deployment script
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('=== PRODUCTION DEPLOYMENT SCRIPT ===');

// Step 1: Prepare the environment
console.log('\n📋 Step 1: Preparing environment...');
try {
  // Ensure we're in production mode
  process.env.NODE_ENV = 'production';
  console.log('Set NODE_ENV to production');
  
  // Backup .env.local if it exists
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  const envLocalBackupPath = path.resolve(process.cwd(), '.env.local.backup');
  
  if (fs.existsSync(envLocalPath)) {
    console.log('Found .env.local - backing up to .env.local.backup');
    fs.renameSync(envLocalPath, envLocalBackupPath);
  }
  
  // Verify .env.production exists
  const envProdPath = path.resolve(process.cwd(), '.env.production');
  if (!fs.existsSync(envProdPath)) {
    throw new Error('.env.production file not found');
  }
  console.log('✅ .env.production file found');
  
  // Load production environment variables
  require('dotenv').config({ path: envProdPath });
  console.log('✅ Loaded environment variables from .env.production');
} catch (err) {
  console.error('❌ Error preparing environment:', err);
  process.exit(1);
}

// Step 2: Start the production server
console.log('\n📋 Step 2: Starting production server...');
try {
  const nextBin = path.resolve(process.cwd(), 'node_modules', '.bin', 'next');
  const args = ['start', '-H', '0.0.0.0', '-p', '3000'];
  
  console.log(`Executing: ${nextBin} ${args.join(' ')}`);
  
  const nextProcess = spawn(nextBin, args, {
    stdio: 'inherit',
    env: process.env
  });
  
  nextProcess.on('error', (err) => {
    console.error('❌ Failed to start production server:', err);
    process.exit(1);
  });
  
  nextProcess.on('close', (code) => {
    console.log(`Production server exited with code ${code}`);
    
    // Restore .env.local if it was backed up
    if (fs.existsSync(envLocalBackupPath)) {
      fs.renameSync(envLocalBackupPath, envLocalPath);
      console.log('Restored .env.local from backup');
    }
    
    process.exit(code);
  });
  
  // Handle termination signals
  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
    process.on(signal, () => {
      console.log(`Received ${signal}, shutting down production server...`);
      nextProcess.kill(signal);
      
      // Restore .env.local if it was backed up
      if (fs.existsSync(envLocalBackupPath)) {
        fs.renameSync(envLocalBackupPath, envLocalPath);
        console.log('Restored .env.local from backup');
      }
    });
  });
} catch (err) {
  console.error('❌ Error starting production server:', err);
  
  // Restore .env.local if it was backed up
  if (fs.existsSync(envLocalBackupPath)) {
    fs.renameSync(envLocalBackupPath, envLocalPath);
    console.log('Restored .env.local from backup');
  }
  
  process.exit(1);
}