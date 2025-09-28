@echo off
echo Setting up TaskFlow Database...
echo.

REM Check if MySQL is available
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL is not installed or not in PATH
    echo Please install MySQL first from: https://dev.mysql.com/downloads/installer/
    pause
    exit /b 1
)

echo Creating database...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS task_management;"

echo Importing schema...
mysql -u root -p task_management < server/schema.sql

echo Seeding demo data...
node server/scripts/seed.js

echo.
echo Database setup complete!
echo You can now run: npm run dev
pause
