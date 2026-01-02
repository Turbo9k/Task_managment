// Script to create a user with properly hashed password
// Run this with: node server/create-user-proper.js

// Set Neon connection string BEFORE loading database config
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_S3UyGDtEiwp6@ep-quiet-glade-adtl40ds-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.NODE_ENV = 'production';

const { pool } = require('./config/database');
const bcrypt = require('bcryptjs');

async function createUser() {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Hash password
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed');

    // Check if user exists (using pool.execute which converts ? to $1, $2, etc.)
    const [existing] = await pool.execute(
      'SELECT id, email FROM users WHERE email = ?',
      ['admin@example.com']
    );

    if (existing.length > 0) {
      console.log('⚠️  User already exists. Updating password...');
      await pool.execute(
        'UPDATE users SET password = ?, is_active = TRUE WHERE email = ?',
        [hashedPassword, 'admin@example.com']
      );
      console.log('✅ Password updated');
    } else {
      // Create user
      const [result] = await pool.execute(
        'INSERT INTO users (email, password, name, is_active, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) RETURNING id',
        ['admin@example.com', hashedPassword, 'Admin User', true]
      );
      console.log('✅ User created with ID:', result[0].id);
    }

    // Verify user (include password for testing)
    const [users] = await pool.execute(
      'SELECT id, email, name, password, is_active FROM users WHERE email = ?',
      ['admin@example.com']
    );
    console.log('✅ User verified:', {
      id: users[0].id,
      email: users[0].email,
      name: users[0].name,
      is_active: users[0].is_active,
      password_length: users[0].password ? users[0].password.length : 0
    });

    // Test password
    if (users[0].password) {
      const testPassword = await bcrypt.compare('password123', users[0].password);
      console.log('✅ Password test:', testPassword ? 'PASSED ✅' : 'FAILED ❌');
      if (!testPassword) {
        console.log('⚠️  Password hash:', users[0].password.substring(0, 20) + '...');
        console.log('⚠️  Re-hashing password...');
        const newHash = await bcrypt.hash('password123', 12);
        await pool.execute(
          'UPDATE users SET password = ? WHERE email = ?',
          [newHash, 'admin@example.com']
        );
        console.log('✅ Password re-hashed and updated');
        
        // Test again
        const [updatedUsers] = await pool.execute(
          'SELECT password FROM users WHERE email = ?',
          ['admin@example.com']
        );
        const testAgain = await bcrypt.compare('password123', updatedUsers[0].password);
        console.log('✅ Password test after update:', testAgain ? 'PASSED ✅' : 'FAILED ❌');
      }
    } else {
      console.log('❌ Password field is NULL or empty');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

createUser();

