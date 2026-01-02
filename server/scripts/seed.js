const { pool, testConnection } = require('../config/database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    await testConnection();
    console.log('🌱 Starting database seeding...');

    // Clear existing data (PostgreSQL syntax)
    await pool.execute('TRUNCATE TABLE notifications CASCADE');
    await pool.execute('TRUNCATE TABLE activity_log CASCADE');
    await pool.execute('TRUNCATE TABLE task_attachments CASCADE');
    await pool.execute('TRUNCATE TABLE task_comments CASCADE');
    await pool.execute('TRUNCATE TABLE tasks CASCADE');
    await pool.execute('TRUNCATE TABLE project_users CASCADE');
    await pool.execute('TRUNCATE TABLE projects CASCADE');
    await pool.execute('TRUNCATE TABLE users CASCADE');

    // Create sample users (for development/testing)
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
        'INSERT INTO users (email, password, name, avatar, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) RETURNING id',
        [user.email, user.password, user.name, user.avatar]
      );
      userIds.push(result[0].id);
    }

    console.log('✅ Created sample users');

    // Create sample projects with realistic timestamps
    const projects = [
      {
        name: 'Website Redesign',
        description: 'Complete redesign of the company website with modern UI/UX',
        color: '#3B82F6',
        created_by: userIds[0],
        created_at: new Date(now - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        updated_at: new Date(now - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        name: 'Mobile App Development',
        description: 'Building a cross-platform mobile application for task management',
        color: '#10B981',
        created_by: userIds[1],
        created_at: new Date(now - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        updated_at: new Date(now - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        name: 'Marketing Campaign',
        description: 'Q4 marketing campaign for product launch',
        color: '#F59E0B',
        created_by: userIds[2],
        created_at: new Date(now - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        updated_at: new Date(now - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        name: 'Database Migration',
        description: 'Migrating legacy database to new cloud infrastructure',
        color: '#EF4444',
        created_by: userIds[0],
        created_at: new Date(now - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        updated_at: new Date(now - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        name: 'API Integration',
        description: 'Integrating third-party APIs for payment and authentication',
        color: '#8B5CF6',
        created_by: userIds[3],
        created_at: new Date(now - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updated_at: new Date(now - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        name: 'Security Audit',
        description: 'Comprehensive security review and vulnerability assessment',
        color: '#EC4899',
        created_by: userIds[4],
        created_at: new Date(now - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updated_at: new Date(now - 1 * 60 * 60 * 1000) // 1 hour ago
      }
    ];

    const projectIds = [];
    for (const project of projects) {
      const [result] = await pool.execute(
        'INSERT INTO projects (name, description, color, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
        [project.name, project.description, project.color, project.created_by, project.created_at, project.updated_at]
      );
      projectIds.push(result[0].id);
    }

    console.log('✅ Created sample projects');

    // Add users to projects (more realistic distribution)
    const projectMembers = [
      // Website Redesign
      { project_id: projectIds[0], user_id: userIds[0], role: 'admin' },
      { project_id: projectIds[0], user_id: userIds[1], role: 'member' },
      { project_id: projectIds[0], user_id: userIds[2], role: 'member' },
      { project_id: projectIds[0], user_id: userIds[3], role: 'member' },
      
      // Mobile App Development
      { project_id: projectIds[1], user_id: userIds[1], role: 'admin' },
      { project_id: projectIds[1], user_id: userIds[0], role: 'member' },
      { project_id: projectIds[1], user_id: userIds[3], role: 'member' },
      { project_id: projectIds[1], user_id: userIds[4], role: 'member' },
      
      // Marketing Campaign
      { project_id: projectIds[2], user_id: userIds[2], role: 'admin' },
      { project_id: projectIds[2], user_id: userIds[4], role: 'member' },
      { project_id: projectIds[2], user_id: userIds[1], role: 'member' },
      
      // Database Migration
      { project_id: projectIds[3], user_id: userIds[0], role: 'admin' },
      { project_id: projectIds[3], user_id: userIds[3], role: 'member' },
      { project_id: projectIds[3], user_id: userIds[4], role: 'member' },
      
      // API Integration
      { project_id: projectIds[4], user_id: userIds[3], role: 'admin' },
      { project_id: projectIds[4], user_id: userIds[0], role: 'member' },
      { project_id: projectIds[4], user_id: userIds[1], role: 'member' },
      
      // Security Audit
      { project_id: projectIds[5], user_id: userIds[4], role: 'admin' },
      { project_id: projectIds[5], user_id: userIds[0], role: 'member' },
      { project_id: projectIds[5], user_id: userIds[2], role: 'member' }
    ];

    for (const member of projectMembers) {
      await pool.execute(
        'INSERT INTO project_users (project_id, user_id, role, joined_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        [member.project_id, member.user_id, member.role]
      );
    }

    console.log('✅ Added users to projects');

    // Create sample tasks with realistic timestamps
    const now = new Date();
    const tasks = [
      // Website Redesign tasks
      {
        title: 'Design new homepage layout',
        description: 'Create wireframes and mockups for the new homepage design',
        project_id: projectIds[0],
        assignee_id: userIds[1],
        priority: 'high',
        status: 'done',
        created_at: new Date(now - 40 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 5 * 24 * 60 * 60 * 1000),
        due_date: new Date(now - 3 * 24 * 60 * 60 * 1000),
        created_by: userIds[0]
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build mobile-friendly navigation component',
        project_id: projectIds[0],
        assignee_id: userIds[2],
        priority: 'medium',
        status: 'in_progress',
        created_at: new Date(now - 35 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 2 * 24 * 60 * 60 * 1000),
        due_date: new Date(now + 3 * 24 * 60 * 60 * 1000),
        created_by: userIds[0]
      },
      {
        title: 'Optimize page loading speed',
        description: 'Implement lazy loading and optimize images',
        project_id: projectIds[0],
        assignee_id: userIds[1],
        priority: 'medium',
        status: 'todo',
        created_at: new Date(now - 30 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 30 * 24 * 60 * 60 * 1000),
        due_date: new Date(now + 7 * 24 * 60 * 60 * 1000),
        created_by: userIds[0]
      },
      {
        title: 'Create user dashboard',
        description: 'Design and implement user dashboard with analytics',
        project_id: projectIds[0],
        assignee_id: userIds[3],
        priority: 'high',
        status: 'done',
        created_at: new Date(now - 25 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 10 * 24 * 60 * 60 * 1000),
        due_date: new Date(now - 8 * 24 * 60 * 60 * 1000),
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
        created_at: new Date(now - 28 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 20 * 24 * 60 * 60 * 1000),
        due_date: new Date(now - 18 * 24 * 60 * 60 * 1000),
        created_by: userIds[1]
      },
      {
        title: 'Design user authentication flow',
        description: 'Create login and registration screens',
        project_id: projectIds[1],
        assignee_id: userIds[3],
        priority: 'high',
        status: 'in_progress',
        created_at: new Date(now - 20 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 1 * 24 * 60 * 60 * 1000),
        due_date: new Date(now + 2 * 24 * 60 * 60 * 1000),
        created_by: userIds[1]
      },
      {
        title: 'Implement task management features',
        description: 'Build core task CRUD operations',
        project_id: projectIds[1],
        assignee_id: userIds[0],
        priority: 'high',
        status: 'todo',
        created_at: new Date(now - 15 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 15 * 24 * 60 * 60 * 1000),
        due_date: new Date(now + 10 * 24 * 60 * 60 * 1000),
        created_by: userIds[1]
      },
      {
        title: 'Add push notifications',
        description: 'Implement push notification system for task updates',
        project_id: projectIds[1],
        assignee_id: userIds[4],
        priority: 'medium',
        status: 'done',
        created_at: new Date(now - 12 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 5 * 24 * 60 * 60 * 1000),
        due_date: new Date(now - 4 * 24 * 60 * 60 * 1000),
        created_by: userIds[1]
      },
      
      // Marketing Campaign tasks
      {
        title: 'Create social media content calendar',
        description: 'Plan and schedule posts for Q4 campaign',
        project_id: projectIds[2],
        assignee_id: userIds[2],
        priority: 'medium',
        status: 'done',
        created_at: new Date(now - 18 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 3 * 24 * 60 * 60 * 1000),
        due_date: new Date(now - 2 * 24 * 60 * 60 * 1000),
        created_by: userIds[2]
      },
      {
        title: 'Design promotional materials',
        description: 'Create banners, flyers, and digital assets',
        project_id: projectIds[2],
        assignee_id: userIds[4],
        priority: 'medium',
        status: 'in_progress',
        created_at: new Date(now - 15 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 4 * 60 * 60 * 1000),
        due_date: new Date(now + 2 * 24 * 60 * 60 * 1000),
        created_by: userIds[2]
      },
      {
        title: 'Launch email campaign',
        description: 'Set up and send promotional emails to subscriber list',
        project_id: projectIds[2],
        assignee_id: userIds[1],
        priority: 'high',
        status: 'todo',
        created_at: new Date(now - 10 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 10 * 24 * 60 * 60 * 1000),
        due_date: new Date(now + 5 * 24 * 60 * 60 * 1000),
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
        created_at: new Date(now - 13 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 12 * 24 * 60 * 60 * 1000),
        due_date: new Date(now - 11 * 24 * 60 * 60 * 1000),
        created_by: userIds[0]
      },
      {
        title: 'Set up new cloud infrastructure',
        description: 'Configure AWS RDS and networking',
        project_id: projectIds[3],
        assignee_id: userIds[4],
        priority: 'high',
        status: 'in_progress',
        created_at: new Date(now - 10 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 2 * 60 * 60 * 1000),
        due_date: new Date(now + 1 * 24 * 60 * 60 * 1000),
        created_by: userIds[0]
      },
      {
        title: 'Test data migration scripts',
        description: 'Validate data integrity after migration',
        project_id: projectIds[3],
        assignee_id: userIds[3],
        priority: 'high',
        status: 'todo',
        created_at: new Date(now - 8 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 8 * 24 * 60 * 60 * 1000),
        due_date: new Date(now + 3 * 24 * 60 * 60 * 1000),
        created_by: userIds[0]
      },
      
      // API Integration tasks
      {
        title: 'Integrate payment gateway',
        description: 'Connect Stripe API for payment processing',
        project_id: projectIds[4],
        assignee_id: userIds[3],
        priority: 'high',
        status: 'done',
        created_at: new Date(now - 8 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 3 * 24 * 60 * 60 * 1000),
        due_date: new Date(now - 2 * 24 * 60 * 60 * 1000),
        created_by: userIds[3]
      },
      {
        title: 'Set up OAuth providers',
        description: 'Configure Google and GitHub OAuth integration',
        project_id: projectIds[4],
        assignee_id: userIds[0],
        priority: 'medium',
        status: 'in_progress',
        created_at: new Date(now - 6 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 1 * 60 * 60 * 1000),
        due_date: new Date(now + 4 * 24 * 60 * 60 * 1000),
        created_by: userIds[3]
      },
      {
        title: 'Implement webhook handlers',
        description: 'Create webhook endpoints for third-party services',
        project_id: projectIds[4],
        assignee_id: userIds[1],
        priority: 'medium',
        status: 'todo',
        created_at: new Date(now - 4 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 4 * 24 * 60 * 60 * 1000),
        due_date: new Date(now + 6 * 24 * 60 * 60 * 1000),
        created_by: userIds[3]
      },
      
      // Security Audit tasks
      {
        title: 'Run vulnerability scan',
        description: 'Perform automated security scanning of codebase',
        project_id: projectIds[5],
        assignee_id: userIds[4],
        priority: 'urgent',
        status: 'done',
        created_at: new Date(now - 6 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 4 * 24 * 60 * 60 * 1000),
        due_date: new Date(now - 3 * 24 * 60 * 60 * 1000),
        created_by: userIds[4]
      },
      {
        title: 'Review access controls',
        description: 'Audit user permissions and role-based access',
        project_id: projectIds[5],
        assignee_id: userIds[0],
        priority: 'high',
        status: 'in_progress',
        created_at: new Date(now - 5 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 30 * 60 * 1000),
        due_date: new Date(now + 2 * 24 * 60 * 60 * 1000),
        created_by: userIds[4]
      },
      {
        title: 'Penetration testing',
        description: 'Conduct manual security testing and exploit validation',
        project_id: projectIds[5],
        assignee_id: userIds[2],
        priority: 'high',
        status: 'todo',
        created_at: new Date(now - 3 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now - 3 * 24 * 60 * 60 * 1000),
        due_date: new Date(now + 7 * 24 * 60 * 60 * 1000),
        created_by: userIds[4]
      }
    ];

    const taskIds = [];
    for (const task of tasks) {
      const [result] = await pool.execute(`
        INSERT INTO tasks (title, description, project_id, assignee_id, priority, status, due_date, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `, [
        task.title, task.description, task.project_id, task.assignee_id,
        task.priority, task.status, task.due_date, task.created_by,
        task.created_at, task.updated_at
      ]);
      taskIds.push(result[0].id);
    }

    console.log('✅ Created sample tasks');

    // Create sample comments
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
        'INSERT INTO task_comments (task_id, user_id, content, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        [comment.task_id, comment.user_id, comment.content]
      );
    }

    console.log('✅ Created sample comments');

    // Create sample notifications
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
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        notification.user_id, notification.project_id, notification.task_id,
        notification.type, notification.title, notification.message
      ]);
    }

    console.log('✅ Created sample notifications');

    // Create activity logs for realistic tracking
    const activities = [
      // Website Redesign activities
      { project_id: projectIds[0], user_id: userIds[1], action: 'task_completed', entity_type: 'task', entity_id: taskIds[0], details: { task_title: 'Design new homepage layout' } },
      { project_id: projectIds[0], user_id: userIds[2], action: 'task_updated', entity_type: 'task', entity_id: taskIds[1], details: { status: 'in_progress' } },
      { project_id: projectIds[0], user_id: userIds[0], action: 'project_updated', entity_type: 'project', entity_id: projectIds[0], details: { field: 'description' } },
      { project_id: projectIds[0], user_id: userIds[3], action: 'task_completed', entity_type: 'task', entity_id: taskIds[3], details: { task_title: 'Create user dashboard' } },
      
      // Mobile App activities
      { project_id: projectIds[1], user_id: userIds[1], action: 'task_completed', entity_type: 'task', entity_id: taskIds[4], details: { task_title: 'Set up React Native project' } },
      { project_id: projectIds[1], user_id: userIds[3], action: 'task_updated', entity_type: 'task', entity_id: taskIds[5], details: { status: 'in_progress' } },
      { project_id: projectIds[1], user_id: userIds[4], action: 'task_completed', entity_type: 'task', entity_id: taskIds[7], details: { task_title: 'Add push notifications' } },
      
      // Marketing Campaign activities
      { project_id: projectIds[2], user_id: userIds[2], action: 'task_completed', entity_type: 'task', entity_id: taskIds[8], details: { task_title: 'Create social media content calendar' } },
      { project_id: projectIds[2], user_id: userIds[4], action: 'task_updated', entity_type: 'task', entity_id: taskIds[9], details: { status: 'in_progress' } },
      
      // Database Migration activities
      { project_id: projectIds[3], user_id: userIds[3], action: 'task_completed', entity_type: 'task', entity_id: taskIds[11], details: { task_title: 'Backup existing database' } },
      { project_id: projectIds[3], user_id: userIds[4], action: 'task_updated', entity_type: 'task', entity_id: taskIds[12], details: { status: 'in_progress' } },
      
      // API Integration activities
      { project_id: projectIds[4], user_id: userIds[3], action: 'task_completed', entity_type: 'task', entity_id: taskIds[13], details: { task_title: 'Integrate payment gateway' } },
      { project_id: projectIds[4], user_id: userIds[0], action: 'task_updated', entity_type: 'task', entity_id: taskIds[14], details: { status: 'in_progress' } },
      
      // Security Audit activities
      { project_id: projectIds[5], user_id: userIds[4], action: 'task_completed', entity_type: 'task', entity_id: taskIds[16], details: { task_title: 'Run vulnerability scan' } },
      { project_id: projectIds[5], user_id: userIds[0], action: 'task_updated', entity_type: 'task', entity_id: taskIds[17], details: { status: 'in_progress' } }
    ];

    for (const activity of activities) {
      await pool.execute(`
        INSERT INTO activity_log (project_id, user_id, action, entity_type, entity_id, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?::jsonb, CURRENT_TIMESTAMP)
      `, [
        activity.project_id, activity.user_id, activity.action,
        activity.entity_type, activity.entity_id, JSON.stringify(activity.details)
      ]);
    }

    console.log('✅ Created activity logs');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Accounts Created:');
    console.log('Admin: admin@demo.com / password123');
    console.log('John: john@demo.com / password123');
    console.log('Jane: jane@demo.com / password123');
    console.log('Mike: mike@demo.com / password123');
    console.log('Sarah: sarah@demo.com / password123');
    console.log('\n⚠️  Note: Change these passwords in production!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
};

seedDatabase();
