# 🚀 TaskFlow Deployment Guide

This guide will walk you through deploying your TaskFlow application to GitHub and Vercel.

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] **Git** installed and configured
- [ ] **Node.js** (v16 or higher) installed
- [ ] **npm** or **yarn** package manager
- [ ] **GitHub account** with repository access
- [ ] **Vercel account** (free tier available)
- [ ] **MySQL database** (local or cloud)

## 🎯 Quick Deployment (Automated)

### Option 1: Using the Deployment Script

**For Windows:**
```bash
deploy.bat
```

**For Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

The script will automatically:
- Install dependencies
- Build the application
- Commit changes to Git
- Push to GitHub
- Deploy to Vercel

## 🔧 Manual Deployment Steps

### Step 1: Prepare Your Repository

1. **Initialize Git (if not already done)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: TaskFlow application"
   ```

2. **Create GitHub Repository**
   - Go to [GitHub](https://github.com)
   - Click "New repository"
   - Name it `taskflow` (or your preferred name)
   - Make it public or private
   - Don't initialize with README (we already have one)

3. **Connect Local Repository to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Step 3: Build the Application

```bash
cd client
npm run build
cd ..
```

### Step 4: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy the Application**
   ```bash
   vercel
   ```

   Follow the prompts:
   - **Set up and deploy?** → Yes
   - **Which scope?** → Select your account
   - **Link to existing project?** → No (for first deployment)
   - **What's your project's name?** → taskflow
   - **In which directory is your code located?** → ./
   - **Want to override the settings?** → No

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## ⚙️ Environment Configuration

### Vercel Environment Variables

In your Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```env
NODE_ENV=production
PORT=3000
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_secure_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Database Setup

#### Option 1: Local MySQL
1. Install MySQL locally
2. Create a database named `taskflow`
3. Run the setup script:
   ```bash
   node setup-database.bat  # Windows
   ./setup-database.sh      # Linux/Mac
   ```

#### Option 2: Cloud Database (Recommended)
1. **PlanetScale** (Free tier available)
   - Sign up at [planetscale.com](https://planetscale.com)
   - Create a new database
   - Get connection details

2. **Railway** (Free tier available)
   - Sign up at [railway.app](https://railway.app)
   - Create a new MySQL database
   - Get connection details

3. **Supabase** (Free tier available)
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Get connection details

## 🔍 Verification Steps

### 1. Check GitHub Repository
- [ ] Code is pushed to GitHub
- [ ] All files are present
- [ ] README.md is visible

### 2. Check Vercel Deployment
- [ ] Application is deployed
- [ ] Environment variables are set
- [ ] Build logs show no errors

### 3. Test the Application
- [ ] Visit your Vercel URL
- [ ] Application loads without errors
- [ ] Dark mode toggle works
- [ ] Chat features are functional
- [ ] Role-based styling is visible

## 🐛 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules client/node_modules
npm install
cd client && npm install && cd ..
```

#### Vercel Deployment Issues
```bash
# Check Vercel logs
vercel logs

# Redeploy
vercel --prod
```

#### Database Connection Issues
- Verify environment variables in Vercel
- Check database credentials
- Ensure database is accessible from Vercel

#### Environment Variables Not Loading
- Restart Vercel deployment after adding variables
- Check variable names match exactly
- Ensure no extra spaces in values

### Getting Help

1. **Check Vercel Logs**
   ```bash
   vercel logs
   ```

2. **Check Build Logs**
   - Go to Vercel Dashboard
   - Click on your deployment
   - Check "Functions" tab for server logs

3. **GitHub Issues**
   - Check if all files are committed
   - Verify .gitignore is correct

## 📊 Performance Optimization

### Vercel Configuration

Update `vercel.json` for better performance:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["server/**"]
      }
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "server/index.js": {
      "maxDuration": 30
    }
  }
}
```

## 🔄 Continuous Deployment

### Automatic Deployments
- Vercel automatically deploys when you push to the main branch
- Set up branch protection rules in GitHub
- Use feature branches for development

### Manual Deployments
```bash
# Deploy specific branch
vercel --prod

# Deploy preview
vercel
```

## 📈 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor performance metrics
- Track user interactions

### Error Tracking
- Set up error tracking (Sentry, LogRocket)
- Monitor application health
- Set up alerts for critical errors

## 🎉 Success!

Your TaskFlow application should now be live! 

**Next Steps:**
1. Share your application URL with team members
2. Set up monitoring and analytics
3. Configure custom domain (optional)
4. Set up CI/CD pipeline for automated testing

**Your Application URL:** `https://your-app-name.vercel.app`

---

**Need Help?** 
- Check the [README.md](README.md) for detailed setup instructions
- Open an issue on GitHub
- Contact the development team

Happy coding! 🚀