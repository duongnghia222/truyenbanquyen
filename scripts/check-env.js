// Script to check if environment variables are loaded correctly
const path = require('path');

// Load environment variables using our custom loader
require('./load-env');

console.log('===== ENVIRONMENT VARIABLES CHECK =====');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
console.log(`NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
// Log a masked version of sensitive credentials
console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? '******** (set)' : 'not set'}`);
console.log(`AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '******** (set)' : 'not set'}`);
console.log(`AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '******** (set)' : 'not set'}`);
console.log(`AWS_REGION: ${process.env.AWS_REGION}`);
console.log(`AWS_S3_BUCKET_NAME: ${process.env.AWS_S3_BUCKET_NAME}`);
console.log('======================================');

// Check if we're loading from .env.production
if (process.env.NODE_ENV === 'production' && 
    process.env.NEXT_PUBLIC_APP_URL === 'http://truyenlight.com') {
  console.log('✅ Successfully loaded variables from .env.production');
} else {
  console.log('❌ Not loading from .env.production or variables are incorrect');
  console.log(`Current environment: ${process.env.NODE_ENV}`);
} 