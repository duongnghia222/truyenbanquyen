import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Singleton pattern for S3 client
let s3ClientInstance: S3Client | null = null;

// Cache for S3 client configuration
interface S3Config {
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

const defaultConfig: S3Config = {
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
};

// Validate required environment variables
function validateEnvVars() {
  const requiredVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET_NAME'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Get S3 client instance (creates new one if doesn't exist)
export function getS3Client(config: Partial<S3Config> = {}): S3Client {
  // Validate required environment variables
  validateEnvVars();
  
  if (!s3ClientInstance) {
    try {
      const mergedConfig = { ...defaultConfig, ...config };
      
      s3ClientInstance = new S3Client({
        region: mergedConfig.region,
        credentials: {
          accessKeyId: mergedConfig.credentials.accessKeyId,
          secretAccessKey: mergedConfig.credentials.secretAccessKey,
        },
        // Optimized configuration options
        maxAttempts: 3, // Max retry attempts
        requestHandler: {
          // HTTP/2 connection pooling is enabled by default
          connectionTimeout: 10000, // 10 second connection timeout (increased from 5s)
        },
      });
      
      console.log('✅ S3 client initialized successfully');
    } catch (error) {
      console.error('❌ S3 client initialization error:', error);
      throw error;
    }
  }
  
  return s3ClientInstance;
}

// Sleep utility for retry with exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry utility function
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoffFactor = 2
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Attempt ${attempt + 1} failed, retrying...`);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < retries - 1) {
        // Wait with exponential backoff before retrying
        const backoffDelay = delay * Math.pow(backoffFactor, attempt);
        await sleep(backoffDelay);
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

// Upload file to S3
export async function uploadToS3(
  fileKey: string,
  fileBuffer: Buffer,
  contentType: string,
  bucketName: string = process.env.AWS_S3_BUCKET_NAME!
): Promise<string> {
  const s3 = getS3Client();
  
  try {
    // Prepare upload command
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: contentType,
    });
    
    // Upload file with retries
    await withRetry(
      () => s3.send(command),
      3,  // 3 retries
      1000, // Start with 1 second delay
      2  // Exponential backoff factor
    );
    
    // Generate the URL
    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    console.log(`✅ File uploaded successfully to: ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload file to S3: ${(error as Error).message}`);
  }
}

// Reset S3 client - useful for testing or when credentials change
export function resetS3Client(): void {
  s3ClientInstance = null;
}

// Graceful cleanup function
export function cleanupS3Client(): void {
  try {
    if (s3ClientInstance) {
      // No close/destroy method in AWS SDK v3, but we can set to null to release memory
      s3ClientInstance = null;
      console.log('S3 client resources released');
    }
  } catch (error) {
    console.error('Error cleaning up S3 client:', error);
  }
} 