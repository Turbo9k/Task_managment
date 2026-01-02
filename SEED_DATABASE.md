# 🌱 Seed Database with Demo Data

## Run the Seed Script

To populate your Neon database with realistic demo data:

```bash
node server/scripts/seed.js
```

Make sure your `.env` file has the correct Neon database credentials:
```env
DATABASE_URL=postgresql://neondb_owner:npg_S3UyGDtEiwp6@ep-quiet-glade-adtl40ds-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

Or set individual parameters:
```env
DB_HOST=ep-quiet-glade-adtl40ds-pooler.c-2.us-east-1.aws.neon.tech
DB_USER=neondb_owner
DB_PASSWORD=npg_S3UyGDtEiwp6
DB_NAME=neondb
NODE_ENV=production
```

## What Gets Created

### Users (5 demo accounts)
- **admin@demo.com** / password123 (Admin User)
- **john@demo.com** / password123 (John Doe)
- **jane@demo.com** / password123 (Jane Smith)
- **mike@demo.com** / password123 (Mike Johnson)
- **sarah@demo.com** / password123 (Sarah Wilson)

### Projects (6 projects)
1. Website Redesign
2. Mobile App Development
3. Marketing Campaign
4. Database Migration
5. API Integration
6. Security Audit

### Tasks (18 tasks total)
- Distributed across all 6 projects
- Mix of statuses: done, in_progress, todo
- Realistic timestamps and due dates
- Assigned to different team members

### Activity Logs
- Real tracking data showing task completions and updates
- Project updates
- Proper timestamps for analytics

## Features

✅ **Real Analytics** - All metrics are calculated from actual data
✅ **Team Performance** - Shows real users from your projects
✅ **Consistent Data** - Analytics match across Dashboard and Analytics views
✅ **Real Tracking** - Activity logs show actual user actions
✅ **Multiple Projects** - 6 projects with realistic distribution

## After Seeding

1. Log in as any demo user
2. Check Analytics page - should show real metrics
3. Check Dashboard - should show real project data
4. Team Performance - should show other demo users
5. All data is interconnected and realistic



