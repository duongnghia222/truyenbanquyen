#!/usr/bin/env node

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { Client } from 'pg';
import path from 'path';
import runMigrations from '../migrations/runner';

// Load environment variables
dotenv.config();

// Get database details from environment variables or use defaults
const dbUser = process.env.POSTGRES_USER || 'postgres';
const dbPass = process.env.POSTGRES_PASSWORD || '';
const dbHost = process.env.POSTGRES_HOST || 'localhost';
const dbPort = parseInt(process.env.POSTGRES_PORT || '5432');
const dbName = process.env.POSTGRES_DB || 'truyenbanquyen';

/**
 * Create database if it doesn't exist
 */
async function createDatabaseIfNotExists() {
  // Connect to PostgreSQL server (not the specific database)
  const client = new Client({
    user: dbUser,
    password: dbPass,
    host: dbHost,
    port: dbPort,
    database: 'postgres', // Connect to default postgres database
  });

  try {
    await client.connect();
    
    // Check if our database exists
    const checkResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    
    if (checkResult.rows.length === 0) {
      console.log(`Database '${dbName}' does not exist. Creating it now...`);
      
      // Create database - we can't use parameterized queries for this
      // But since dbName comes from env variable or hardcoded, it's safe
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Create .env file with PostgreSQL config if it doesn't exist
 */
function updateEnvironmentFile() {
  try {
    // Check current .env file
    let envContent;
    try {
      envContent = require('fs').readFileSync('.env', 'utf8');
    } catch (err) {
      // File might not exist, create it
      envContent = '';
    }

    // Add or update PostgreSQL variables if they don't exist
    const pgVariables = [
      'POSTGRES_USER=postgres',
      'POSTGRES_PASSWORD=',
      'POSTGRES_HOST=localhost',
      'POSTGRES_PORT=5432',
      `POSTGRES_DB=${dbName}`,
    ];

    let modified = false;
    for (const variable of pgVariables) {
      const [key] = variable.split('=');
      if (!envContent.includes(`${key}=`)) {
        envContent += `\n${variable}`;
        modified = true;
      }
    }

    if (modified) {
      require('fs').writeFileSync('.env', envContent);
      console.log('.env file updated with PostgreSQL configuration.');
    }
  } catch (error) {
    console.error('Error updating .env file:', error);
  }
}

/**
 * Main function to set up database
 */
async function setupDatabase() {
  try {
    console.log('Setting up PostgreSQL database...');
    
    // Ensure environment is properly configured
    updateEnvironmentFile();
    
    // Create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Run migrations
    await runMigrations();
    
    console.log('Database setup complete. You can now use PostgreSQL with your application.');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase().then(() => {
    console.log('Database setup completed successfully.');
  }).catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

export default setupDatabase; 