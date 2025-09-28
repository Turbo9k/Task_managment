#!/bin/bash

# TaskFlow Deployment Script
echo "🚀 Starting TaskFlow deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build client
echo "🏗️ Building client..."
cd client
npm install
npm run build
cd ..

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at the URL provided above"
echo ""
echo "📋 Next steps:"
echo "1. Set up your database (MySQL)"
echo "2. Configure environment variables in Vercel dashboard"
echo "3. Run the database schema: mysql -u root -p task_management < server/schema.sql"
echo "4. Seed demo data: npm run seed"
echo ""
echo "🎉 Happy coding!"
