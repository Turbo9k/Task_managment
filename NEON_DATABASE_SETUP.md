# 🚀 Quick Neon Database Setup

## Step 1: Create Database in Neon

1. Go to your Neon Dashboard: https://console.neon.tech
2. Select your project
3. Go to **SQL Editor**
4. Run this command to create the database:
   ```sql
   CREATE DATABASE task_management;
   ```

## Step 2: Select the Database

In the SQL Editor, make sure you're connected to the `task_management` database (use the database dropdown at the top).

## Step 3: Run the Schema

1. Open `server/schema-postgresql.sql` file
2. Copy ALL the contents
3. Paste into Neon SQL Editor
4. Click **Run** or press `Ctrl+Enter`

This will create all the tables:
- users
- projects
- project_users
- tasks
- task_comments
- task_attachments
- activity_log
- notifications

## Step 4: Verify Tables

Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 8 tables listed.

## Step 5: Test Connection

After deployment, test: `https://your-vercel-url.vercel.app/api/test-db`

## Common Issues

### Database name mismatch
- Make sure `DB_NAME` in Vercel matches the database name in Neon
- Default is: `task_management`

### Connection still fails
- Check that you're using the correct database in Neon SQL Editor
- Verify environment variables in Vercel match your Neon credentials



