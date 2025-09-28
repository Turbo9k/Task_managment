const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Looking for MySQL installation...\n');

const possiblePaths = [
  'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
  'C:\\Program Files (x86)\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
  'C:\\Program Files\\MySQL\\MySQL Server 5.7\\bin\\mysql.exe',
  'C:\\Program Files (x86)\\MySQL\\MySQL Server 5.7\\bin\\mysql.exe',
  path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WindowsApps', 'mysql.exe'),
  'mysql' // If it's in PATH
];

async function testPath(mysqlPath) {
  return new Promise((resolve) => {
    const command = mysqlPath === 'mysql' ? 'mysql --version' : `"${mysqlPath}" --version`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({ found: false, error: error.message });
      } else {
        resolve({ found: true, version: stdout.trim() });
      }
    });
  });
}

async function findMySQL() {
  for (const mysqlPath of possiblePaths) {
    console.log(`Testing: ${mysqlPath}`);
    const result = await testPath(mysqlPath);
    
    if (result.found) {
      console.log(`✅ Found MySQL: ${result.version}`);
      console.log(`📍 Path: ${mysqlPath}`);
      
      // Create a .env file with the correct path
      const envContent = `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=task_management
MYSQL_PATH=${mysqlPath}

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
NODE_ENV=development

# Client URL (for CORS and OAuth callbacks)
CLIENT_URL=http://localhost:8080
`;
      
      fs.writeFileSync('.env', envContent);
      console.log('\n✅ Created .env file with MySQL path');
      console.log('\n📝 Next steps:');
      console.log('1. Update the DB_PASSWORD in .env file');
      console.log('2. Run: node setup-database-manual.js');
      
      return;
    } else {
      console.log(`❌ Not found: ${result.error}`);
    }
  }
  
  console.log('\n❌ MySQL not found in any common locations');
  console.log('\n🔧 Please try one of these:');
  console.log('1. Install MySQL from Microsoft Store');
  console.log('2. Download MySQL Installer from https://dev.mysql.com/downloads/installer/');
  console.log('3. Use XAMPP instead: https://www.apachefriends.org/download.html');
}

findMySQL();
