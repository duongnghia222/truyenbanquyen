import fs from 'fs';
import path from 'path';
import pool from '../config/database';

/**
 * Execute a SQL file
 * @param filePath Path to the SQL file
 */
const executeSqlFile = async (filePath: string): Promise<void> => {
  try {
    console.log(`Executing SQL file: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split the SQL file by statements (separated by semicolons)
    // This is a simple implementation and might not handle all edge cases
    const statements = sql
      .split(';')
      .filter(statement => statement.trim() !== '')
      .map(statement => statement.trim() + ';');
    
    // Execute each statement in a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const statement of statements) {
        await client.query(statement);
      }
      
      await client.query('COMMIT');
      console.log(`Successfully executed: ${filePath}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error executing ${filePath}:`, error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Failed to execute SQL file ${filePath}:`, error);
    throw error;
  }
};

/**
 * Run all migrations in the migrations directory
 */
const runMigrations = async (): Promise<void> => {
  const migrationsDir = path.join(__dirname);
  
  try {
    // Create migrations_history table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations_history (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Get all SQL files in the migrations directory
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure they run in the correct order
    
    // Get already executed migrations
    const { rows: executedMigrations } = await pool.query(
      'SELECT migration_name FROM migrations_history'
    );
    const executedMigrationNames = executedMigrations.map(row => row.migration_name);
    
    // Execute each migration that hasn't been run yet
    for (const file of files) {
      if (!executedMigrationNames.includes(file)) {
        const filePath = path.join(migrationsDir, file);
        await executeSqlFile(filePath);
        
        // Record the migration in the history
        await pool.query(
          'INSERT INTO migrations_history (migration_name) VALUES ($1)',
          [file]
        );
        
        console.log(`Migration ${file} completed successfully`);
      } else {
        console.log(`Migration ${file} already executed, skipping...`);
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations().then(() => {
    console.log('Migration process completed');
    process.exit(0);
  }).catch(error => {
    console.error('Migration process failed:', error);
    process.exit(1);
  });
}

export default runMigrations; 