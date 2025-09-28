const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'task_management'
  };

  console.log('📋 Connection details:');
  console.log(`   Host: ${config.host}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Password: ${config.password ? '***' : '(empty)'}`);
  console.log('');

  try {
    // Test connection
    const connection = await mysql.createConnection(config);
    console.log('✅ Database connection successful!');
    
    // Test if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    
    // Test if data exists
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users in database: ${users[0].count}`);
    
    await connection.end();
    console.log('\n🎉 Database is ready to use!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error('\n🔧 Troubleshooting:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   - MySQL service is not running');
      console.error('   - Check if MySQL is installed and started');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   - Wrong username or password');
      console.error('   - Check your .env file credentials');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   - Database does not exist');
      console.error('   - Run: mysql -u root -p -e "CREATE DATABASE task_management;"');
    } else {
      console.error('   - Check your .env file configuration');
      console.error('   - Make sure MySQL is properly installed');
    }
    
    console.error('\n📖 See DATABASE_SETUP.md for detailed instructions');
    process.exit(1);
  }
}

testDatabaseConnection();
