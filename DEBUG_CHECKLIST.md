# 🔍 Debugging Checklist

## Step 1: Test API Endpoints

Visit these URLs in your browser:

1. **Health Check**: `https://your-vercel-url.vercel.app/api/health`
   - Should return: `{"status":"OK","timestamp":"..."}`

2. **Database Test**: `https://your-vercel-url.vercel.app/api/test-db`
   - Should return database connection info
   - If error, check the error message

3. **API Root**: `https://your-vercel-url.vercel.app/api`
   - Should return API info

## Step 2: Check Vercel Function Logs

1. Go to Vercel Dashboard
2. Select your project
3. Go to Deployments → Latest
4. Click "Functions" tab
5. Click on `api/index.js`
6. Check for errors (especially database connection errors)

## Step 3: Verify Environment Variables

In Vercel Dashboard → Settings → Environment Variables, verify:

- ✅ `DB_HOST` - Your Neon host (e.g., `ep-xxx-xxx.us-east-1.aws.neon.tech`)
- ✅ `DB_USER` - Your Neon username
- ✅ `DB_PASSWORD` - Your Neon password
- ✅ `DB_NAME` - `task_management`
- ✅ `JWT_SECRET` - Set to a secure value
- ✅ `NODE_ENV` - `production`
- ✅ `CLIENT_URL` - Your Vercel app URL

## Step 4: Verify Database Setup

1. **Go to Neon Dashboard**
2. **Open SQL Editor**
3. **Run this query to check tables:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
4. **Should see these tables:**
   - users
   - projects
   - project_users
   - tasks
   - task_comments
   - task_attachments
   - activity_log
   - notifications

## Step 5: Test Database Connection

In Neon SQL Editor, try:
```sql
SELECT COUNT(*) FROM users;
```

If this works, your database is accessible.

## Step 6: Common Issues

### Issue: "Cannot GET /api/health"
- **Solution**: Check Vercel deployment completed successfully

### Issue: Database connection timeout
- **Solution**: Check DB_HOST is correct (no `https://` prefix, just hostname)

### Issue: Authentication failed
- **Solution**: Verify DB_USER and DB_PASSWORD are correct

### Issue: Database does not exist
- **Solution**: Make sure DB_NAME matches your Neon database name

### Issue: Table does not exist
- **Solution**: Run `schema-postgresql.sql` in Neon SQL Editor

## Step 7: Test Login

1. Go to your app: `https://your-vercel-url.vercel.app`
2. Try to login
3. Check browser console (F12) for errors
4. Check Vercel function logs for backend errors

## What to Share

If still not working, share:
1. Response from `/api/test-db` endpoint
2. Any errors from Vercel function logs
3. Browser console errors (if any)
4. What happens when you try to login





