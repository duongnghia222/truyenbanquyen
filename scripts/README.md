# Database Migration Scripts

This directory contains scripts for database migrations and maintenance.

## Database Setup and Migration

This directory contains scripts for initializing the PostgreSQL database and running migrations.

### How to Run

1. Make sure you have Node.js installed
2. Make sure your `.env` file contains the correct PostgreSQL connection details
3. Run the setup and migration scripts with the following command:

```bash
npm run db:setup
npm run db:migrate
```

### What the Scripts Do

These scripts handle:
1. Creating the database if it doesn't exist
2. Running schema migrations to create or update tables
3. Importing data if needed

### Expected Output

The scripts will output information about the database operations, including:

- Database creation status
- Migration operations performed
- Data import status

If there are any errors, the script will output the error message and exit with a non-zero status code. 