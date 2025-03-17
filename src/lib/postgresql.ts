import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Type for PostgreSQL connection cache
type PostgresCache = {
  pool: Pool | null;
  client: PoolClient | null;
  isConnecting: boolean;
};

// Declare global variable to maintain connection across hot reloads
declare global {
  var postgres: PostgresCache;
}

// Initialize cache
var postgres: PostgresCache;

// Initialize global cache if it doesn't exist yet
if (!global.postgres) {
  global.postgres = { pool: null, client: null, isConnecting: false };
}

postgres = global.postgres;

// Get database connection details
const getConnectionConfig = () => {
  // Check if required environment variables are available
  if (!process.env.POSTGRES_USER || !process.env.POSTGRES_PASSWORD || !process.env.POSTGRES_DB) {
    throw new Error('PostgreSQL connection details missing. Please check your .env file.');
  }

  return {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB,
  };
};

// Connection pool options
const poolOptions = {
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 10000, // Connection timeout
};

/**
 * Connect to PostgreSQL and return the Pool instance
 */
async function connectDB(): Promise<Pool> {
  // If already connected, return the existing pool
  if (postgres.pool && !postgres.isConnecting) {
    return postgres.pool;
  }

  // Mark as connecting to prevent multiple connection attempts
  postgres.isConnecting = true;

  try {
    const config = getConnectionConfig();
    
    // Create a new connection pool if one doesn't exist
    if (!postgres.pool) {
      postgres.pool = new Pool({
        ...config,
        ...poolOptions,
      });

      // Set up event handlers
      postgres.pool.on('error', (err) => {
        console.error('PostgreSQL pool error:', err);
      });

      postgres.pool.on('connect', () => {
        console.log('New PostgreSQL connection established');
      });
    }

    // Test the connection
    const client = await postgres.pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    console.log('✅ PostgreSQL connected successfully');
    postgres.isConnecting = false;
    return postgres.pool;
  } catch (e) {
    postgres.isConnecting = false;
    console.error('Failed to connect to PostgreSQL:', e);
    
    // Clean up if connection failed
    if (postgres.pool) {
      await postgres.pool.end();
      postgres.pool = null;
    }
    
    throw new Error('Failed to establish PostgreSQL connection');
  }
}

/**
 * Gracefully closes all PostgreSQL connections
 */
export async function closeConnections(): Promise<void> {
  if (postgres.pool) {
    await postgres.pool.end();
    postgres.pool = null;
    console.log('PostgreSQL connections closed');
  }
}

/**
 * Execute a query with optional parameters
 */
export async function query(text: string, params?: any[]) {
  const pool = await connectDB();
  const start = Date.now();
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
}

/**
 * Execute a transaction with multiple queries
 */
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = await connectDB();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default connectDB; 