# 🔧 Fix Database Connection

## Issue
Your Neon connection string shows the database is `neondb`, but the code defaults to `task_management`.

## Solution Options

### Option 1: Use DATABASE_URL (Recommended)
Neon provides a connection string that includes the correct database name.

1. **Get your connection string from Neon:**
   - Go to Neon Dashboard → Your Project
   - Click "Connection Details"
   - Copy the connection string (it looks like):
     ```
     postgresql://username:password@hostname/database?sslmode=require
     ```

2. **Add to Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add new variable:
     - **Name**: `DATABASE_URL`
     - **Value**: Your full connection string from Neon
     - **Environments**: Production, Preview, Development

3. **The code will automatically use DATABASE_URL if it exists!**

### Option 2: Use Individual Parameters (Recommended for your case)
Since your connection string uses `neondb`, set these in Vercel:

1. **In Vercel Environment Variables:**
   - `DB_NAME=your-database-name` ⚠️ (use your actual database name)
   - `DB_HOST=your-host.neon.tech`
   - `DB_USER=your-database-user`
   - `DB_PASSWORD=your-database-password`
   - `DB_PORT=5432` (optional)

2. **Remove `DATABASE_URL` if it exists** (so it uses individual parameters)

### Option 3: Use DATABASE_URL (Alternative)
If you prefer using `DATABASE_URL`:

1. **Your connection string format:**
   ```
   postgresql://username:password@hostname/database?sslmode=require
   ```
   (Replace with your actual credentials from Neon Dashboard)

2. **Add to Vercel:**
   - Name: `DATABASE_URL`
   - Value: Your full connection string above
   - Environments: Production, Preview, Development

3. **Remove individual DB_* variables** (if they exist) so `DATABASE_URL` takes priority

## After Fixing

1. **Redeploy** (or wait for next deployment)
2. **Test**: `https://your-vercel-url.vercel.app/api/test-db`
3. **Should show**: `{"status":"OK","database":"connected"}`

## Recommended: Use Option 1 (DATABASE_URL)
This is the easiest and most reliable method!

