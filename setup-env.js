const fs = require('fs');
const path = require('path');

// Create .env file with default values
const envContent = `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=task_management

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
NODE_ENV=development

# Client URL (for CORS and OAuth callbacks)
CLIENT_URL=http://localhost:8080

# OAuth Configuration (Optional - for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

// Create .env file if it doesn't exist
if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', envContent);
  console.log('✅ Created .env file with default values');
  console.log('📝 Please edit .env file and update your database credentials');
} else {
  console.log('⚠️  .env file already exists');
}

// Create client .env file
const clientEnvContent = `# API Configuration
VUE_APP_API_URL=http://localhost:3000/api

# Socket.io Configuration
VUE_APP_SOCKET_URL=http://localhost:3000

# App Configuration
VUE_APP_TITLE=TaskFlow
VUE_APP_DESCRIPTION=Collaborative Task Management
`;

const clientEnvPath = path.join('client', '.env');
if (!fs.existsSync(clientEnvPath)) {
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ Created client/.env file');
} else {
  console.log('⚠️  client/.env file already exists');
}

console.log('\n🚀 Next steps:');
console.log('1. Install MySQL or use XAMPP');
console.log('2. Update database credentials in .env file');
console.log('3. Run: node server/schema.sql to create database');
console.log('4. Run: npm run seed to add demo data');
console.log('5. Run: npm run dev to start the application');
