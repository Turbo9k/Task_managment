@echo off
REM TaskFlow Deployment Script for Windows
REM This script helps deploy the TaskFlow application to GitHub and Vercel

echo 🚀 TaskFlow Deployment Script
echo ==============================

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed. Please install Git first.
    exit /b 1
)

REM Check if node is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)

echo [INFO] Checking project structure...

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the project root directory.
    exit /b 1
)

if not exist "client\package.json" (
    echo [ERROR] Please run this script from the project root directory.
    exit /b 1
)

echo [SUCCESS] Project structure looks good!

REM Step 1: Install dependencies
echo [INFO] Installing dependencies...
call npm install
cd client
call npm install
cd ..
echo [SUCCESS] Dependencies installed!

REM Step 2: Build the application
echo [INFO] Building the application...
cd client
call npm run build
cd ..
echo [SUCCESS] Application built successfully!

REM Step 3: Check git status
echo [INFO] Checking git status...
git status --porcelain > temp_status.txt
set /p status_output=<temp_status.txt
del temp_status.txt

if not "%status_output%"=="" (
    echo [WARNING] There are uncommitted changes. Please commit them first.
    echo Uncommitted files:
    git status --porcelain
    echo.
    set /p commit_choice="Do you want to commit these changes? (y/n): "
    if /i "%commit_choice%"=="y" (
        echo [INFO] Committing changes...
        git add .
        git commit -m "feat: enhance UI with vibrant design, dark mode, role differentiation, and chat features"
        echo [SUCCESS] Changes committed!
    ) else (
        echo [ERROR] Please commit your changes before deploying.
        exit /b 1
    )
)

REM Step 4: Check if remote origin exists
echo [INFO] Checking git remote...
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] No remote origin found. Please add a GitHub repository:
    echo git remote add origin https://github.com/yourusername/taskflow.git
    echo git branch -M main
    echo git push -u origin main
    exit /b 1
)

REM Step 5: Push to GitHub
echo [INFO] Pushing to GitHub...
git push origin main
echo [SUCCESS] Code pushed to GitHub!

REM Step 6: Check if Vercel CLI is installed
echo [INFO] Checking Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Vercel CLI is not installed. Installing now...
    call npm install -g vercel
    echo [SUCCESS] Vercel CLI installed!
)

REM Step 7: Deploy to Vercel
echo [INFO] Deploying to Vercel...
if exist ".vercel\project.json" (
    echo [INFO] Updating existing Vercel deployment...
    call vercel --prod
) else (
    echo [INFO] Creating new Vercel deployment...
    call vercel
)

echo [SUCCESS] Deployment completed!

echo.
echo 🎉 Deployment Summary
echo ====================
echo ✅ Code pushed to GitHub
echo ✅ Application deployed to Vercel
echo.
echo Next steps:
echo 1. Configure environment variables in Vercel dashboard
echo 2. Set up your database (MySQL recommended)
echo 3. Test your deployed application
echo.
echo Environment variables needed:
echo - NODE_ENV=production
echo - DB_HOST=your_database_host
echo - DB_USER=your_database_user
echo - DB_PASSWORD=your_database_password
echo - DB_NAME=your_database_name
echo - JWT_SECRET=your_jwt_secret
echo.
echo [SUCCESS] Happy coding! 🚀
pause
