require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { pool } = require('../config/database');

const listUsers = async () => {
  try {
    console.log('Connecting to database...');
    
    // Get all users
    const [users] = await pool.execute(`
      SELECT 
        id,
        email,
        name,
        provider,
        is_active,
        created_at,
        CASE WHEN password IS NULL THEN 'OAuth (no password)' ELSE 'Has password' END as password_status
      FROM users
      ORDER BY created_at DESC
    `);

    console.log('\n=== ALL USERS ===\n');
    console.log(`Total users: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Provider: ${user.provider}`);
      console.log(`   Active: ${user.is_active}`);
      console.log(`   Password: ${user.password_status}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });

    // Get project admins
    const [projectAdmins] = await pool.execute(`
      SELECT 
        u.id,
        u.email,
        u.name,
        p.name as project_name,
        pu.role
      FROM project_users pu
      JOIN users u ON pu.user_id = u.id
      JOIN projects p ON pu.project_id = p.id
      WHERE pu.role = 'admin'
      ORDER BY p.name, u.name
    `);

    if (projectAdmins.length > 0) {
      console.log('\n=== PROJECT ADMINS ===\n');
      projectAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email})`);
        console.log(`   Project: ${admin.project_name}`);
        console.log(`   Role: ${admin.role}`);
        console.log('');
      });
    } else {
      console.log('\n=== PROJECT ADMINS ===\n');
      console.log('No project admins found.\n');
    }

    // Get users with local passwords (can reset password)
    const [localUsers] = await pool.execute(`
      SELECT id, email, name
      FROM users
      WHERE provider = 'local' AND password IS NOT NULL
      ORDER BY email
    `);

    if (localUsers.length > 0) {
      console.log('\n=== USERS WITH PASSWORDS (can reset) ===\n');
      localUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} - ${user.email} (ID: ${user.id})`);
      });
      console.log('');
    }

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total users: ${users.length}`);
    console.log(`Local users (with password): ${localUsers.length}`);
    console.log(`OAuth users: ${users.length - localUsers.length}`);
    console.log(`Project admins: ${projectAdmins.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
};

listUsers();

