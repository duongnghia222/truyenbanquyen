# Database Migration Scripts

This directory contains scripts for database migrations and maintenance.

## Generate Slugs Script

The `generate-slugs.js` script is used to generate slugs for all existing novels in the database. This script should be run once after adding the slug field to the Novel model.

### How to Run

1. Make sure you have Node.js installed
2. Make sure your `.env` file contains the correct `MONGODB_URI` value
3. Run the script with the following command:

```bash
node scripts/generate-slugs.js
```

### What the Script Does

1. Connects to your MongoDB database
2. Finds all novels that don't have a slug field
3. Generates a slug for each novel based on its title
4. Checks if the slug already exists, and if so, appends a random string to make it unique
5. Saves the novel with the new slug

### Expected Output

The script will output information about each novel it updates, including:

- The number of novels found without slugs
- The title and generated slug for each novel
- Any conflicts that were resolved by generating unique slugs
- A success message when all novels have been updated

If there are any errors, the script will output the error message and exit with a non-zero status code. 