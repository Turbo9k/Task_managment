# 🚀 Complete Deployment Guide

## Phase 1: Local Development (XAMPP)

### Step 1: Set up XAMPP
1. **Download XAMPP**: https://www.apachefriends.org/download.html
2. **Install XAMPP** (default settings)
3. **Open XAMPP Control Panel**
4. **Start MySQL service** (click "Start" next to MySQL)
5. **Open phpMyAdmin** (click "Admin" next to MySQL)

### Step 2: Create Database
1. **In phpMyAdmin:**
   - Click "New" in left sidebar
   - Database name: `task_management`
   - Click "Create"

2. **Import Schema:**
   - Select `task_management` database
   - Click "Import" tab
   - Choose file: `server/schema.sql`
   - Click "Go"

### Step 3: Configure Local Environment
```bash
# Copy local environment file
copy env.local .env

# Install dependencies
npm install
cd client && npm install

# Seed demo data
npm run seed

# Start development server
npm run dev
```

**Your app will be available at: http://localhost:8080**

---

## Phase 2: Vercel Deployment (Cloud Database)

### Option 1: Neon (Recommended - Free)

1. **Sign up**: https://neon.tech
2. **Create database**: 
   - Name: `task_management`
   - Region: Choose closest to you
3. **Get connection details**:
   - Go to your project dashboard
   - Copy the connection string from "Connection Details"
4. **Update environment variables**:
   ```
   DB_HOST=your-neon-host
   DB_USER=your-neon-user
   DB_PASSWORD=your-neon-password
   DB_NAME=task_management
   ```

### Option 2: Railway (Free Tier)

1. **Sign up**: https://railway.app
2. **Create new project**
3. **Add MySQL database**:
   - Click "New" → "Database" → "MySQL"
4. **Get connection details** from database settings
5. **Update environment variables** with Railway credentials

### Option 3: Supabase (PostgreSQL - Free)

1. **Sign up**: https://supabase.com
2. **Create new project**
3. **Get connection details** from Settings → Database
4. **Update schema** for PostgreSQL (I can help with this)

### Option 4: Turso (SQLite - Free)

1. **Sign up**: https://turso.tech
2. **Create database**: `task_management`
3. **Get connection details** from dashboard
4. **Note**: Uses SQLite instead of MySQL (schema needs minor adjustments)

### Option 5: AWS RDS (Free Tier)

1. **Sign up**: https://aws.amazon.com
2. **Create RDS instance** (MySQL)
3. **Use free tier** (750 hours/month, 20GB storage)
4. **Get connection details** from RDS console

---

## Phase 3: Deploy to Vercel

### Step 1: Prepare for Deployment
```bash
# Build the frontend
cd client
npm run build
cd ..

# Test production build locally
npm start
```

### Step 2: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Go to your project → Settings → Environment Variables
# Add all variables from env.production
```

### Step 3: Configure Vercel
1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add all variables** from `env.production`
5. **Redeploy** your project

---

## Environment Variables for Vercel

Copy these to Vercel Dashboard → Settings → Environment Variables:

```
DB_HOST=your-cloud-database-host
DB_USER=your-cloud-database-user
DB_PASSWORD=your-cloud-database-password
DB_NAME=task_management
JWT_SECRET=your-super-secure-jwt-secret
CLIENT_URL=https://your-app-name.vercel.app
```

---

## Database Migration

### From Local to Cloud:
1. **Export local data** (optional):
   ```bash
   mysqldump -u root -p task_management > backup.sql
   ```

2. **Import to cloud database**:
   ```bash
   mysql -h your-cloud-host -u your-user -p task_management < server/schema.sql
   mysql -h your-cloud-host -u your-user -p task_management < backup.sql
   ```

3. **Or just run the seed script** against cloud database:
   ```bash
   # Update .env with cloud credentials first
   npm run seed
   ```

---

## Troubleshooting

### Local Development Issues:
- **XAMPP MySQL not starting**: Check if port 3306 is free
- **Connection refused**: Make sure MySQL service is running
- **Permission denied**: Check database credentials

### Vercel Deployment Issues:
- **Database connection failed**: Check environment variables
- **Build failed**: Check Node.js version compatibility
- **CORS errors**: Verify CLIENT_URL in environment variables

### Database Issues:
- **Schema errors**: Make sure you imported `server/schema.sql`
- **Data not showing**: Run `npm run seed` after setting up database
- **Connection timeout**: Check database host and credentials

---

## Quick Commands

```bash
# Local development
npm run dev

# Test database connection
node test-db.js

# Seed demo data
npm run seed

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

## Support

If you run into issues:
1. Check the error messages in terminal
2. Verify your environment variables
3. Make sure your cloud database is accessible
4. Check Vercel deployment logs

**Happy coding! 🎉**
