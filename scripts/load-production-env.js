// Script to explicitly load production environment variables
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

function loadProductionEnv() {
  console.log('Loading production environment variables...');
  
  // Set NODE_ENV to production
  process.env.NODE_ENV = 'production';
  
  // Define the path to the production environment file
  const envProductionPath = path.resolve(process.cwd(), '.env.production');
  
  // Check if the file exists
  if (!fs.existsSync(envProductionPath)) {
    console.error(`❌ ERROR: .env.production file not found at ${envProductionPath}`);
    console.error('Please create this file with your production environment variables.');
    return false;
  }
  
  // Load the production environment variables
  console.log(`Loading environment variables from: ${envProductionPath}`);
  const result = dotenv.config({ path: envProductionPath, override: true });
  
  if (result.error) {
    console.error(`Error loading ${envProductionPath}:`, result.error);
    return false;
  }
  
  console.log('✅ Successfully loaded production environment variables');
  
  // Verify critical environment variables
  const criticalVars = [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_API_URL',
    'NEXTAUTH_URL',
    'MONGODB_URI',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY'
  ];
  
  const missingVars = criticalVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ WARNING: Missing critical environment variables in production:');
    missingVars.forEach(varName => console.warn(`  - ${varName}`));
    return false;
  }
  
  console.log('✅ All critical environment variables are set');
  
  // Log the loaded environment variables (with sensitive ones masked)
  console.log('\n===== PRODUCTION ENVIRONMENT VARIABLES =====');
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
  console.log(`NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
  console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
  console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? '******** (set)' : 'not set'}`);
  console.log(`AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '******** (set)' : 'not set'}`);
  console.log(`AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '******** (set)' : 'not set'}`);
  console.log(`AWS_REGION: ${process.env.AWS_REGION}`);
  console.log(`AWS_S3_BUCKET_NAME: ${process.env.AWS_S3_BUCKET_NAME}`);
  console.log('===========================================\n');
  
  return true;
}

// Load the production environment variables
const success = loadProductionEnv();

// Export the result
module.exports = {
  success,
  env: process.env
}; 