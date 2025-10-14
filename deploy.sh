#!/bin/bash

# TaskFlow Deployment Script
# This script helps deploy the TaskFlow application to GitHub and Vercel

set -e

echo "🚀 TaskFlow Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Checking project structure..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "client/package.json" ]; then
    print_error "Please run this script from the project root directory."
    exit 1
fi

print_success "Project structure looks good!"

# Step 1: Install dependencies
print_status "Installing dependencies..."
npm install
cd client && npm install && cd ..
print_success "Dependencies installed!"

# Step 2: Build the application
print_status "Building the application..."
cd client && npm run build && cd ..
print_success "Application built successfully!"

# Step 3: Check git status
print_status "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "There are uncommitted changes. Please commit them first."
    echo "Uncommitted files:"
    git status --porcelain
    echo ""
    read -p "Do you want to commit these changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Committing changes..."
        git add .
        git commit -m "feat: enhance UI with vibrant design, dark mode, role differentiation, and chat features"
        print_success "Changes committed!"
    else
        print_error "Please commit your changes before deploying."
        exit 1
    fi
fi

# Step 4: Check if remote origin exists
print_status "Checking git remote..."
if ! git remote get-url origin &> /dev/null; then
    print_warning "No remote origin found. Please add a GitHub repository:"
    echo "git remote add origin https://github.com/yourusername/taskflow.git"
    echo "git branch -M main"
    echo "git push -u origin main"
    exit 1
fi

# Step 5: Push to GitHub
print_status "Pushing to GitHub..."
git push origin main
print_success "Code pushed to GitHub!"

# Step 6: Check if Vercel CLI is installed
print_status "Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI is not installed. Installing now..."
    npm install -g vercel
    print_success "Vercel CLI installed!"
fi

# Step 7: Deploy to Vercel
print_status "Deploying to Vercel..."
if [ -f ".vercel/project.json" ]; then
    print_status "Updating existing Vercel deployment..."
    vercel --prod
else
    print_status "Creating new Vercel deployment..."
    vercel
fi

print_success "Deployment completed!"

echo ""
echo "🎉 Deployment Summary"
echo "===================="
echo "✅ Code pushed to GitHub"
echo "✅ Application deployed to Vercel"
echo ""
echo "Next steps:"
echo "1. Configure environment variables in Vercel dashboard"
echo "2. Set up your database (MySQL recommended)"
echo "3. Test your deployed application"
echo ""
echo "Environment variables needed:"
echo "- NODE_ENV=production"
echo "- DB_HOST=your_database_host"
echo "- DB_USER=your_database_user"
echo "- DB_PASSWORD=your_database_password"
echo "- DB_NAME=your_database_name"
echo "- JWT_SECRET=your_jwt_secret"
echo ""
print_success "Happy coding! 🚀"