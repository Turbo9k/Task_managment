# Database Setup Guide

## Quick Start Options

### Option 1: XAMPP (Recommended for Beginners)

1. **Download XAMPP:**
   - Go to https://www.apachefriends.org/download.html
   - Download and install XAMPP for Windows

2. **Start MySQL:**
   - Open XAMPP Control Panel
   - Click "Start" next to MySQL
   - Click "Admin" to open phpMyAdmin

3. **Create Database:**
   - In phpMyAdmin, click "New" in the left sidebar
   - Database name: `task_management`
   - Click "Create"

4. **Import Schema:**
   - Select the `task_management` database
   - Click "Import" tab
   - Choose file: `server/schema.sql`
   - Click "Go"

5. **Update .env file:**
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=task_management
   ```

### Option 2: MySQL Installer

1. **Download MySQL:**
   - Go to https://dev.mysql.com/downloads/installer/
   - Download "MySQL Installer for Windows"

2. **Install:**
   - Run installer as Administrator
   - Choose "Developer Default"
   - Set root password (remember this!)

3. **Create Database:**
   ```bash
   mysql -u root -p
   CREATE DATABASE task_management;
   exit
   ```

4. **Import Schema:**
   ```bash
   mysql -u root -p task_management < server/schema.sql
   ```

5. **Update .env file:**
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_root_password
   DB_NAME=task_management
   ```

### Option 3: Cloud Database (Production)

#### PlanetScale (Free)
1. Sign up at https://planetscale.com
2. Create a new database
3. Get connection string
4. Update .env with cloud credentials

#### Railway (Free)
1. Sign up at https://railway.app
2. Create new project
3. Add MySQL database
4. Get connection details

## After Database Setup

1. **Install Dependencies:**
   ```bash
   npm install
   cd client && npm install
   ```

2. **Seed Demo Data:**
   ```bash
   npm run seed
   ```

3. **Start Application:**
   ```bash
   npm run dev
   ```

## Troubleshooting

### MySQL Not Found
- Make sure MySQL is in your PATH
- Or use full path: `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`

### Connection Refused
- Check if MySQL service is running
- Verify host, port, username, password in .env

### Permission Denied
- Make sure user has CREATE DATABASE privileges
- Try running as Administrator

### Port Already in Use
- Change PORT in .env file
- Or stop other services using port 3000

## Demo Data

The application comes with pre-seeded demo data:

| Email | Password | Role |
|-------|----------|------|
| admin@demo.com | password123 | Admin |
| john@demo.com | password123 | Member |
| jane@demo.com | password123 | Member |
| mike@demo.com | password123 | Member |
| sarah@demo.com | password123 | Member |

## Need Help?

If you're still having issues:
1. Check the error messages in the terminal
2. Verify your .env file has correct database credentials
3. Make sure MySQL service is running
4. Try the XAMPP option for easier setup
