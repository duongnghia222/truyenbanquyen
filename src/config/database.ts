import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'truyenbanquyen',
  password: process.env.POSTGRES_PASSWORD || '',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 60000, // Increased from 30000 to 60000
  connectionTimeoutMillis: 10000, // Increased from 2000 to 10000
});

// Event listeners for connection issues
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't terminate the process, just log the error
  // process.exit(-1);
});

// Helper function for executing queries with retry mechanism
export const query = async (text: string, params?: (string | number | boolean | Date | null | undefined)[]) => {
  const start = Date.now();
  let retries = 3;
  let lastError;

  while (retries > 0) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log(`Query executed in ${duration}ms`);
      return res;
    } catch (error) {
      lastError = error;
      console.error(`Query failed (${retries} retries left):`, { text, error });
      retries--;
      if (retries > 0) {
        // Wait before retrying (500ms, 1000ms, etc.)
        await new Promise(resolve => setTimeout(resolve, (4 - retries) * 500));
      }
    }
  }

  console.error('Error executing query after all retries', { text, error: lastError });
  throw lastError;
};

// Helper function for transactions with retry
export const transaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
  let retries = 3;
  let lastError;

  while (retries > 0) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      lastError = error;
      await client.query('ROLLBACK');
      retries--;
      if (retries > 0) {
        console.error(`Transaction failed (${retries} retries left):`, error);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, (4 - retries) * 500));
      } else {
        throw error;
      }
    } finally {
      client.release();
    }
  }

  throw lastError;
};

export default pool; 