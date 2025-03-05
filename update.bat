@echo off
echo Starting update at %date% %time%

echo Pulling latest changes...
git pull origin main

echo Installing dependencies...
call npm ci

echo Building the application...
call npm run build

echo Restarting the application...
pm2 reload truyenbanquyen || pm2 start ecosystem.config.js

echo Update completed at %date% %time% 