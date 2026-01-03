const { pool } = require('../config/database');
require('dotenv').config();

/**
 * Script to fix project membership issues
 * Adds project creators to project_users if they're missing
 */

async function fixProjectMemberships() {
  try {
    console.log('🔍 Checking for projects with missing creator memberships...\n');

    // Get all projects
    const [projects] = await pool.execute(`
      SELECT id, name, created_by 
      FROM projects 
      ORDER BY id
    `);

    console.log(`Found ${projects.length} projects\n`);

    let fixed = 0;
    let alreadyCorrect = 0;
    let errors = 0;

    for (const project of projects) {
      // Check if creator is in project_users
      const [members] = await pool.execute(`
        SELECT role 
        FROM project_users 
        WHERE project_id = ? AND user_id = ?
      `, [project.id, project.created_by]);

      if (members.length === 0) {
        // Creator is missing - add them as admin
        try {
          await pool.execute(`
            INSERT INTO project_users (project_id, user_id, role, joined_at)
            VALUES (?, ?, 'admin', CURRENT_TIMESTAMP)
          `, [project.id, project.created_by]);

          console.log(`✅ Fixed: Project "${project.name}" (ID: ${project.id}) - Added creator as admin`);
          fixed++;
        } catch (error) {
          if (error.code === '23505' || error.message.includes('unique')) {
            // Duplicate key - already exists somehow
            console.log(`⚠️  Project "${project.name}" (ID: ${project.id}) - Already has membership (race condition?)`);
            alreadyCorrect++;
          } else {
            console.error(`❌ Error fixing project "${project.name}" (ID: ${project.id}):`, error.message);
            errors++;
          }
        }
      } else {
        console.log(`✓ Project "${project.name}" (ID: ${project.id}) - Creator already a member (role: ${members[0].role})`);
        alreadyCorrect++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Already correct: ${alreadyCorrect}`);
    console.log(`   Errors: ${errors}`);

    // Also check for any orphaned project_users (user doesn't exist)
    console.log('\n🔍 Checking for orphaned project_users...');
    const [orphaned] = await pool.execute(`
      SELECT pu.id, pu.project_id, pu.user_id
      FROM project_users pu
      LEFT JOIN users u ON pu.user_id = u.id
      WHERE u.id IS NULL
    `);

    if (orphaned.length > 0) {
      console.log(`⚠️  Found ${orphaned.length} orphaned project_users entries`);
      for (const orphan of orphaned) {
        console.log(`   - Project ${orphan.project_id}, User ${orphan.user_id}`);
      }
    } else {
      console.log('✓ No orphaned project_users found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the fix
fixProjectMemberships();

