# 🔐 Create User Account - Instructions

The password hash in the SQL file might not be correct. Here's how to create a user properly:

## Option 1: Use the Node.js Script (Recommended)

1. **Make sure your `.env` file has the correct Neon database credentials:**
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_S3UyGDtEiwp6@ep-quiet-glade-adtl40ds-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
   OR
   ```env
   DB_HOST=ep-quiet-glade-adtl40ds-pooler.c-2.us-east-1.aws.neon.tech
   DB_USER=neondb_owner
   DB_PASSWORD=npg_S3UyGDtEiwp6
   DB_NAME=neondb
   NODE_ENV=production
   ```

2. **Run the script:**
   ```bash
   node server/create-user-proper.js
   ```

3. **This will:**
   - Connect to your Neon database
   - Hash the password "password123" properly using bcrypt
   - Create or update the user account
   - Verify the password works

## Option 2: Register via the App

1. Go to your Vercel URL
2. Click "Register" or "Sign Up"
3. Create your account with:
   - Email: your email
   - Password: your password
   - Name: your name

## Option 3: Generate Hash Manually

If you want to create the user directly in SQL, you need to generate a proper bcrypt hash:

1. **Run this in Node.js:**
   ```javascript
   const bcrypt = require('bcryptjs');
   bcrypt.hash('password123', 12).then(hash => console.log(hash));
   ```

2. **Copy the hash and use it in SQL:**
   ```sql
   INSERT INTO users (email, password, name, is_active, created_at)
   VALUES (
     'admin@example.com',
     'PASTE_THE_HASH_HERE',
     'Admin User',
     TRUE,
     CURRENT_TIMESTAMP
   )
   ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
   ```

## After Creating User

Login with:
- **Email:** `admin@example.com`
- **Password:** `password123`



