// Script to prepare the environment for production
const fs = require('fs');
const path = require('path');

function prepareProductionEnvironment() {
  console.log('Preparing environment for production...');
  
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  const envLocalBackupPath = path.resolve(process.cwd(), '.env.local.backup');
  
  // Check if .env.local exists
  if (fs.existsSync(envLocalPath)) {
    console.log(`Found .env.local file at ${envLocalPath}`);
    console.log('This file contains development settings that would override production settings.');
    console.log('Temporarily renaming it to .env.local.backup...');
    
    try {
      // Rename .env.local to .env.local.backup
      fs.renameSync(envLocalPath, envLocalBackupPath);
      console.log('✅ Successfully renamed .env.local to .env.local.backup');
      
      // Register cleanup function to restore .env.local on exit
      process.on('exit', () => {
        restoreEnvLocal();
      });
      
      // Also handle signals
      ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
        process.on(signal, () => {
          restoreEnvLocal();
          process.exit(0);
        });
      });
      
      return true;
    } catch (err) {
      console.error('Error renaming .env.local:', err);
      return false;
    }
  } else {
    console.log('No .env.local file found. No action needed.');
    return true;
  }
}

function restoreEnvLocal() {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  const envLocalBackupPath = path.resolve(process.cwd(), '.env.local.backup');
  
  if (fs.existsSync(envLocalBackupPath)) {
    console.log('\nRestoring .env.local from backup...');
    try {
      fs.renameSync(envLocalBackupPath, envLocalPath);
      console.log('✅ Successfully restored .env.local');
    } catch (err) {
      console.error('Error restoring .env.local:', err);
    }
  }
}

// Execute the function
const success = prepareProductionEnvironment();

// Export the result
module.exports = {
  success
}; 