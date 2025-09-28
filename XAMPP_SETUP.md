# 🏠 XAMPP Setup Guide

## Step 1: Download XAMPP
1. Go to https://www.apachefriends.org/download.html
2. Download **XAMPP for Windows** (about 150MB)
3. Run installer as **Administrator**

## Step 2: Install XAMPP
1. **Select components** (default is fine):
   - ✅ Apache
   - ✅ MySQL  
   - ✅ phpMyAdmin
   - ✅ FileZilla (optional)
2. **Choose install location**: `C:\xampp` (default)
3. **Click "Next"** through all steps
4. **Wait for installation** (2-3 minutes)

## Step 3: Start XAMPP
1. **Open XAMPP Control Panel** (from Start Menu)
2. **Start MySQL**:
   - Click "Start" next to MySQL
   - Should show green "Running" status
3. **Start Apache** (optional, for web server):
   - Click "Start" next to Apache

## Step 4: Create Database
1. **Open phpMyAdmin**:
   - Click "Admin" next to MySQL
   - OR go to http://localhost/phpmyadmin
2. **Create database**:
   - Click "New" in left sidebar
   - Database name: `task_management`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

## Step 5: Import Schema
1. **Select `task_management` database** (click on it)
2. **Click "Import" tab**
3. **Choose file**: Browse to `server/schema.sql`
4. **Click "Go"** at bottom
5. **Verify tables created** (should see 7 tables)

## Step 6: Configure Environment
1. **Copy local config**:
   ```bash
   copy env.local .env
   ```
2. **Edit .env file**:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=task_management
   ```

## Step 7: Test Setup
```bash
# Test database connection
node test-db.js

# Install dependencies
npm install
cd client && npm install

# Seed demo data
npm run seed

# Start development server
npm run dev
```

## Troubleshooting

### MySQL Won't Start
- **Port 3306 in use**: Stop other MySQL services
- **Permission denied**: Run XAMPP as Administrator
- **Service error**: Check Windows Services for conflicting MySQL

### phpMyAdmin Issues
- **Access denied**: Check MySQL is running
- **Page not found**: Try http://localhost/phpmyadmin
- **Connection refused**: Restart XAMPP

### Database Import Issues
- **File too large**: Check file size (should be small)
- **Syntax error**: Make sure you selected the right database first
- **Permission denied**: Check file permissions

## Success Indicators
✅ MySQL shows "Running" in XAMPP Control Panel
✅ phpMyAdmin opens without errors
✅ `task_management` database exists with 7 tables
✅ `node test-db.js` shows "Database connection successful!"
✅ `npm run dev` starts without errors

## Next Steps
Once XAMPP is working:
1. Test your app at http://localhost:8080
2. Use demo accounts to explore features
3. Set up Neon for Vercel deployment
4. Deploy to Vercel with cloud database
