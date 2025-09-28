# ☁️ Neon Database Setup for Vercel

## Step 1: Create Neon Account
1. Go to https://neon.tech
2. Click "Sign Up"
3. **No credit card required!**
4. Verify email address

## Step 2: Create Database
1. **Create new project**:
   - Project name: `task-management`
   - Database name: `task_management`
   - Region: Choose closest to you
2. **Wait for setup** (30 seconds)

## Step 3: Get Connection Details
1. **Go to project dashboard**
2. **Click "Connection Details"**
3. **Copy the connection string** (looks like):
   ```
   postgresql://username:password@hostname/database?sslmode=require
   ```

## Step 4: Extract Database Credentials
From the connection string, extract:
- **Host**: `hostname` (e.g., `ep-cool-name-123456.us-east-1.aws.neon.tech`)
- **User**: `username` (e.g., `neondb_owner`)
- **Password**: `password` (e.g., `abc123xyz`)
- **Database**: `database` (e.g., `task_management`)

## Step 5: Update Environment Variables
Update your `.env` file with Neon credentials:
```
DB_HOST=your-neon-host
DB_USER=your-neon-user
DB_PASSWORD=your-neon-password
DB_NAME=task_management
```

## Step 6: Convert MySQL Schema to PostgreSQL
Since Neon uses PostgreSQL, we need to convert the schema:

### Option A: Use the provided PostgreSQL schema
I'll create a PostgreSQL version of the schema for you.

### Option B: Manual conversion
The main differences:
- `AUTO_INCREMENT` → `SERIAL`
- `DATETIME` → `TIMESTAMP`
- `TEXT` → `TEXT` (same)
- `VARCHAR` → `VARCHAR` (same)

## Step 7: Import Schema to Neon
1. **Connect to Neon** using a PostgreSQL client
2. **Run the PostgreSQL schema** (I'll provide this)
3. **Verify tables created**

## Step 8: Test Connection
```bash
# Test database connection
node test-db.js

# Seed demo data
npm run seed
```

## Step 9: Deploy to Vercel
1. **Set environment variables in Vercel**:
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all database credentials

2. **Deploy**:
   ```bash
   vercel --prod
   ```

## Neon Free Tier Limits
- **Storage**: 0.5 GB
- **Databases**: Unlimited
- **Connections**: 100 concurrent
- **Compute**: 100 hours/month
- **Perfect for**: Development and small production apps

## Troubleshooting

### Connection Issues
- **SSL required**: Make sure `sslmode=require` in connection string
- **Host not found**: Check the hostname is correct
- **Authentication failed**: Verify username and password

### Schema Issues
- **Syntax errors**: PostgreSQL syntax is different from MySQL
- **Data type errors**: Some MySQL types don't exist in PostgreSQL
- **Permission denied**: Check user has CREATE TABLE privileges

### Vercel Issues
- **Environment variables**: Make sure all are set in Vercel dashboard
- **Connection timeout**: Check if Neon allows connections from Vercel
- **SSL errors**: Ensure SSL is enabled in connection string

## Success Indicators
✅ Neon project created successfully
✅ Connection string obtained
✅ Environment variables updated
✅ Database connection test passes
✅ Schema imported without errors
✅ Vercel deployment successful

## Next Steps
1. Set up XAMPP for local development
2. Create Neon database for production
3. Convert schema to PostgreSQL
4. Deploy to Vercel with Neon
5. Test both local and production environments
