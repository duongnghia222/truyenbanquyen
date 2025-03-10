// Script to load environment variables for use in other scripts
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

function loadEnv() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`Current NODE_ENV: ${nodeEnv}`);
  
  // Define the paths to the environment files in the correct loading order
  // Next.js loads in this order: .env.${nodeEnv}.local, .env.${nodeEnv}, .env.local, .env
  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), `.env.${nodeEnv}`),
    path.resolve(process.cwd(), `.env.${nodeEnv}.local`)
  ];
  
  // Reverse the array to match Next.js loading order (later files override earlier ones)
  const orderedPaths = [...envPaths].reverse();
  
  // Load each environment file if it exists
  orderedPaths.forEach(envPath => {
    if (fs.existsSync(envPath)) {
      console.log(`Loading environment variables from: ${envPath}`);
      const result = dotenv.config({ path: envPath, override: true });
      if (result.error) {
        console.error(`Error loading ${envPath}:`, result.error);
      } else {
        console.log(`Successfully loaded environment variables from: ${envPath}`);
      }
    } else {
      console.log(`Environment file not found: ${envPath}`);
    }
  });
  
  // Validate critical environment variables in production
  if (nodeEnv === 'production') {
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
    } else {
      console.log('✅ All critical environment variables are set');
    }
  }
  
  // Return the loaded environment variables
  return process.env;
}

// Load the environment variables
const env = loadEnv();

// Export the loaded environment
module.exports = env; 