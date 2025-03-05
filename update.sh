#!/bin/bash

# Print the current date and time
echo "Starting update at $(date)"

# Pull the latest changes from the main branch
echo "Pulling latest changes..."
git pull origin main

# Install dependencies (in case there are new ones)
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building the application..."
npm run build

# Restart the application using PM2
echo "Restarting the application..."
pm2 reload truyenbanquyen || pm2 start ecosystem.config.js

echo "Update completed at $(date)" 