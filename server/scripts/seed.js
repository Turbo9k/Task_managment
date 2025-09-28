const { pool, testConnection } = require('../config/database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    await testConnection();
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    await pool.execute('TRUNCATE TABLE notifications');
    await pool.execute('TRUNCATE TABLE activity_log');
    await pool.execute('TRUNCATE TABLE task_attachments');
    await pool.execute('TRUNCATE TABLE task_comments');
    await pool.execute('TRUNCATE TABLE tasks');
    await pool.execute('TRUNCATE TABLE project_users');
    await pool.execute('TRUNCATE TABLE projects');
    await pool.execute('TRUNCATE TABLE users');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Create demo users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = [
      {
        email: 'admin@demo.com',
        password: hashedPassword,
        name: 'Admin User',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      {
        email: 'john@demo.com',
        password: hashedPassword,
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        email: 'jane@demo.com',
        password: hashedPassword,
        name: 'Jane Smith',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        email: 'mike@demo.com',
        password: hashedPassword,
        name: 'Mike Johnson',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      },
      {
        email: 'sarah@demo.com',
        password: hashedPassword,
        name: 'Sarah Wilson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      }
    ];

    const userIds = [];
    for (const user of users) {
      const [result] = await pool.execute(
        'INSERT INTO users (email, password, name, avatar, created_at) VALUES (?, ?, ?, ?, NOW())',
        [user.email, user.password, user.name, user.avatar]
      );
      userIds.push(result.insertId);
    }

    console.log('✅ Created demo users');

    // Create demo projects
    const projects = [
      {
        name: 'Website Redesign',
        description: 'Complete redesign of the company website with modern UI/UX',
        color: '#3B82F6',
        created_by: userIds[0]
      },
      {
        name: 'Mobile App Development',
        description: 'Building a cross-platform mobile application for task management',
        color: '#10B981',
        created_by: userIds[1]
      },
      {
        name: 'Marketing Campaign',
        description: 'Q4 marketing campaign for product launch',
        color: '#F59E0B',
        created_by: userIds[2]
      },
      {
        name: 'Database Migration',
        description: 'Migrating legacy database to new cloud infrastructure',
        color: '#EF4444',
        created_by: userIds[0]
      }
    ];

    const projectIds = [];
    for (const project of projects) {
      const [result] = await pool.execute(
        'INSERT INTO projects (name, description, color, created_by, created_at) VALUES (?, ?, ?, ?, NOW())',
        [project.name, project.description, project.color, project.created_by]
      );
      projectIds.push(result.insertId);
    }

    console.log('✅ Created demo projects');

    // Add users to projects
    const projectMembers = [
      // Website Redesign
      { project_id: projectIds[0], user_id: userIds[0], role: 'admin' },
      { project_id: projectIds[0], user_id: userIds[1], role: 'member' },
      { project_id: projectIds[0], user_id: userIds[2], role: 'member' },
      
      // Mobile App Development
      { project_id: projectIds[1], user_id: userIds[1], role: 'admin' },
      { project_id: projectIds[1], user_id: userIds[0], role: 'member' },
      { project_id: projectIds[1], user_id: userIds[3], role: 'member' },
      
      // Marketing Campaign
      { project_id: projectIds[2], user_id: userIds[2], role: 'admin' },
      { project_id: projectIds[2], user_id: userIds[4], role: 'member' },
      
      // Database Migration
      { project_id: projectIds[3], user_id: userIds[0], role: 'admin' },
      { project_id: projectIds[3], user_id: userIds[3], role: 'member' },
      { project_id: projectIds[3], user_id: userIds[4], role: 'member' }
    ];

    for (const member of projectMembers) {
      await pool.execute(
        'INSERT INTO project_users (project_id, user_id, role, joined_at) VALUES (?, ?, ?, NOW())',
        [member.project_id, member.user_id, member.role]
      );
    }

    console.log('✅ Added users to projects');

    // Create demo tasks
    const tasks = [
      // Website Redesign tasks
      {
        title: 'Design new homepage layout',
        description: 'Create wireframes and mockups for the new homepage design',
        project_id: projectIds[0],
        assignee_id: userIds[1],
        priority: 'high',
        status: 'in_progress',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        created_by: userIds[0]
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build mobile-friendly navigation component',
        project_id: projectIds[0],
        assignee_id: userIds[2],
        priority: 'medium',
        status: 'todo',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        created_by: userIds[0]
      },
      {
        title: 'Optimize page loading speed',
        description: 'Implement lazy loading and optimize images',
        project_id: projectIds[0],
        assignee_id: userIds[1],
        priority: 'medium',
        status: 'todo',
        created_by: userIds[0]
      },
      
      // Mobile App Development tasks
      {
        title: 'Set up React Native project',
        description: 'Initialize project structure and configure development environment',
        project_id: projectIds[1],
        assignee_id: userIds[1],
        priority: 'high',
        status: 'done',
        created_by: userIds[1]
      },
      {
        title: 'Design user authentication flow',
        description: 'Create login and registration screens',
        project_id: projectIds[1],
        assignee_id: userIds[3],
        priority: 'high',
        status: 'in_progress',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        created_by: userIds[1]
      },
      {
        title: 'Implement task management features',
        description: 'Build core task CRUD operations',
        project_id: projectIds[1],
        assignee_id: userIds[0],
        priority: 'high',
        status: 'todo',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        created_by: userIds[1]
      },
      
      // Marketing Campaign tasks
      {
        title: 'Create social media content calendar',
        description: 'Plan and schedule posts for Q4 campaign',
        project_id: projectIds[2],
        assignee_id: userIds[2],
        priority: 'medium',
        status: 'in_progress',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        created_by: userIds[2]
      },
      {
        title: 'Design promotional materials',
        description: 'Create banners, flyers, and digital assets',
        project_id: projectIds[2],
        assignee_id: userIds[4],
        priority: 'medium',
        status: 'todo',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_by: userIds[2]
      },
      
      // Database Migration tasks
      {
        title: 'Backup existing database',
        description: 'Create full backup before migration process',
        project_id: projectIds[3],
        assignee_id: userIds[3],
        priority: 'urgent',
        status: 'done',
        created_by: userIds[0]
      },
      {
        title: 'Set up new cloud infrastructure',
        description: 'Configure AWS RDS and networking',
        project_id: projectIds[3],
        assignee_id: userIds[4],
        priority: 'high',
        status: 'in_progress',
        due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        created_by: userIds[0]
      },
      {
        title: 'Test data migration scripts',
        description: 'Validate data integrity after migration',
        project_id: projectIds[3],
        assignee_id: userIds[3],
        priority: 'high',
        status: 'todo',
        due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        created_by: userIds[0]
      }
    ];

    const taskIds = [];
    for (const task of tasks) {
      const [result] = await pool.execute(`
        INSERT INTO tasks (title, description, project_id, assignee_id, priority, status, due_date, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        task.title, task.description, task.project_id, task.assignee_id,
        task.priority, task.status, task.due_date, task.created_by
      ]);
      taskIds.push(result.insertId);
    }

    console.log('✅ Created demo tasks');

    // Create demo comments
    const comments = [
      {
        task_id: taskIds[0],
        user_id: userIds[1],
        content: 'Started working on the wireframes. Will have initial designs ready by tomorrow.'
      },
      {
        task_id: taskIds[0],
        user_id: userIds[0],
        content: 'Great! Make sure to follow our brand guidelines for colors and typography.'
      },
      {
        task_id: taskIds[4],
        user_id: userIds[3],
        content: 'Working on the login screen design. Should be ready for review soon.'
      },
      {
        task_id: taskIds[6],
        user_id: userIds[2],
        content: 'Content calendar is looking good. Need to coordinate with the design team for assets.'
      },
      {
        task_id: taskIds[9],
        user_id: userIds[4],
        content: 'Infrastructure setup is 80% complete. Will finish by end of day.'
      }
    ];

    for (const comment of comments) {
      await pool.execute(
        'INSERT INTO task_comments (task_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())',
        [comment.task_id, comment.user_id, comment.content]
      );
    }

    console.log('✅ Created demo comments');

    // Create demo notifications
    const notifications = [
      {
        user_id: userIds[1],
        project_id: projectIds[0],
        task_id: taskIds[0],
        type: 'task_assigned',
        title: 'New task assigned',
        message: 'You have been assigned to "Design new homepage layout"'
      },
      {
        user_id: userIds[2],
        project_id: projectIds[0],
        task_id: taskIds[1],
        type: 'task_assigned',
        title: 'New task assigned',
        message: 'You have been assigned to "Implement responsive navigation"'
      },
      {
        user_id: userIds[3],
        project_id: projectIds[1],
        task_id: taskIds[4],
        type: 'task_assigned',
        title: 'New task assigned',
        message: 'You have been assigned to "Design user authentication flow"'
      }
    ];

    for (const notification of notifications) {
      await pool.execute(`
        INSERT INTO notifications (user_id, project_id, task_id, type, title, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [
        notification.user_id, notification.project_id, notification.task_id,
        notification.type, notification.title, notification.message
      ]);
    }

    console.log('✅ Created demo notifications');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('Admin: admin@demo.com / password123');
    console.log('John: john@demo.com / password123');
    console.log('Jane: jane@demo.com / password123');
    console.log('Mike: mike@demo.com / password123');
    console.log('Sarah: sarah@demo.com / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
};

seedDatabase();
