@echo off
echo Setting up TaskFlow with MySQL...
echo.

REM Try to find MySQL in common locations
set MYSQL_PATH=""
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
) else if exist "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set MYSQL_PATH="C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe"
) else if exist "%LOCALAPPDATA%\Microsoft\WindowsApps\mysql.exe" (
    set MYSQL_PATH="%LOCALAPPDATA%\Microsoft\WindowsApps\mysql.exe"
) else (
    echo ERROR: MySQL not found in common locations
    echo Please make sure MySQL is installed and try one of these:
    echo 1. Add MySQL to your PATH environment variable
    echo 2. Run MySQL from Start menu and complete setup
    echo 3. Install MySQL from https://dev.mysql.com/downloads/installer/
    pause
    exit /b 1
)

echo Found MySQL at: %MYSQL_PATH%
echo.

echo Creating database...
%MYSQL_PATH% -u root -p -e "CREATE DATABASE IF NOT EXISTS task_management;"

echo Importing schema...
%MYSQL_PATH% -u root -p task_management < server/schema.sql

echo Seeding demo data...
node server/scripts/seed.js

echo.
echo Database setup complete!
echo You can now run: npm run dev
pause
