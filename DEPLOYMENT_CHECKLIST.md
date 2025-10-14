# 🚀 GitHub + Vercel + Neon Deployment Checklist

## ✅ Step 1: GitHub Setup
- [ ] Create GitHub account (if you don't have one)
- [ ] Create new repository: `task-management-app`
- [ ] Make repository **Public**
- [ ] Don't initialize with README
- [ ] Copy repository URL

## ✅ Step 2: Push Code to GitHub
```bash
# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## ✅ Step 3: Neon Database Setup
- [ ] Go to https://neon.tech
- [ ] Sign up (no credit card required)
- [ ] Create project: `task-management`
- [ ] Database name: `task_management`
- [ ] Copy connection string
- [ ] Extract credentials:
  - Host: `your-host.neon.tech`
  - User: `your-username`
  - Password: `your-password`
  - Database: `task_management`

## ✅ Step 4: Import Database Schema
- [ ] Go to Neon SQL Editor
- [ ] Copy contents of `server/schema-postgresql.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify 7 tables created

## ✅ Step 5: Vercel Deployment
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Framework Preset: **Other**
- [ ] Root Directory: **Leave empty**
- [ ] Build Command: `cd client && npm run build`
- [ ] Output Directory: `client/dist`

## ✅ Step 6: Environment Variables in Vercel
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:
```
DB_HOST=your-neon-host
DB_USER=your-neon-username
DB_PASSWORD=your-neon-password
DB_NAME=task_management
JWT_SECRET=your-super-secure-jwt-secret-key
CLIENT_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

## ✅ Step 7: Deploy
- [ ] Click "Deploy" in Vercel
- [ ] Wait for deployment (2-3 minutes)
- [ ] Check deployment logs for errors
- [ ] Visit your live app URL

## ✅ Step 8: Seed Demo Data
After deployment, you can seed demo data by:
1. Going to your app URL
2. Registering a new account
3. Or running the seed script (if you add an endpoint)

## 🎉 Success!
Your app should be live at: `https://your-app-name.vercel.app`

## Demo Accounts (if you seed data)
- admin@demo.com / password123
- john@demo.com / password123
- jane@demo.com / password123

## Troubleshooting

### Build Errors
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard

### Database Connection Errors
- Verify environment variables are set correctly
- Check Neon database is running
- Test connection string in Neon dashboard

### CORS Errors
- Make sure CLIENT_URL matches your Vercel app URL
- Check if backend is running (Vercel functions)

## Next Steps
- [ ] Test all features on live app
- [ ] Add custom domain (optional)
- [ ] Set up monitoring (optional)
- [ ] Add more features (optional)

