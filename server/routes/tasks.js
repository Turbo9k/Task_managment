const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const { pool } = require('../config/database');
const { requireRole } = require('../middleware/auth');
const { requireProjectMember } = require('../middleware/projectAuth');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const router = express.Router();

// Helper function to check if user is a member of the project that owns a task
const checkTaskProjectMembership = async (taskId, userId) => {
  try {
    // First get the task's project_id
    const [tasks] = await pool.execute(
      'SELECT project_id FROM tasks WHERE id = ?',
      [taskId]
    );
    
    if (tasks.length === 0) {
      return { isMember: false, error: 'Task not found' };
    }
    
    const projectId = tasks[0].project_id;
    
    // Check if user is a member of the project
    const [members] = await pool.execute(
      'SELECT role FROM project_users WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );
    
    if (members.length === 0) {
      return { isMember: false, error: 'Access denied: You are not a member of this project' };
    }
    
    return { isMember: true, role: members[0].role, projectId };
  } catch (error) {
    console.error('Task project membership check error:', error);
    return { isMember: false, error: 'Internal server error' };
  }
};

// Get all tasks for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, assignee, priority } = req.query;

    let query = `
      SELECT 
        t.*,
        u.name as assignee_name,
        u.avatar as assignee_avatar,
        creator.name as creator_name,
        creator.avatar as creator_avatar,
        COALESCE(comment_counts.comment_count, 0) as comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN (
        SELECT task_id, COUNT(*)::integer as comment_count
        FROM task_comments
        GROUP BY task_id
      ) comment_counts ON t.id = comment_counts.task_id
      WHERE t.project_id = ?
    `;
    
    const params = [projectId];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (assignee) {
      query += ' AND t.assignee_id = ?';
      params.push(assignee);
    }
    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY t.created_at DESC';

    const [tasks] = await pool.execute(query, params);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single task
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [tasks] = await pool.execute(`
      SELECT 
        t.*,
        u.name as assignee_name,
        u.avatar as assignee_avatar,
        creator.name as creator_name,
        creator.avatar as creator_avatar
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN users creator ON t.created_by = creator.id
      WHERE t.id = ?
    `, [id]);

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Get task comments
    const [comments] = await pool.execute(`
      SELECT 
        c.*,
        u.name as author_name,
        u.avatar as author_avatar
      FROM task_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ?
      ORDER BY c.created_at ASC
    `, [id]);

    // Get task attachments
    const [attachments] = await pool.execute(`
      SELECT * FROM task_attachments WHERE task_id = ?
    `, [id]);

    res.json({
      ...tasks[0],
      comments,
      attachments
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create task
router.post('/', [
  body('title').trim().isLength({ min: 1 }),
  body('project_id').isInt(),
  body('description').optional().trim(),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']),
  body('status').isIn(['todo', 'in_progress', 'review', 'done']),
  body('due_date').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  console.log('[CreateTask] Route handler called');
  console.log('[CreateTask] req.body:', JSON.stringify(req.body));
  console.log('[CreateTask] req.user:', { id: req.user.id });
  
  // Validate first
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('[CreateTask] Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Check project membership AFTER validation (so req.body is populated)
  const projectId = req.body.project_id;
  console.log('[CreateTask] Project ID:', projectId);
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }
  
  // Check if user is a member
  const [members] = await pool.execute(
    'SELECT role FROM project_users WHERE project_id = ? AND user_id = ?',
    [projectId, req.user.id]
  );
  
  if (members.length === 0) {
    // Check if user is the project creator
    const [projects] = await pool.execute(
      'SELECT created_by FROM projects WHERE id = ?',
      [projectId]
    );
    
    if (projects.length > 0 && parseInt(projects[0].created_by) === parseInt(req.user.id)) {
      // Auto-add creator as admin
      try {
        await pool.execute(
          'INSERT INTO project_users (project_id, user_id, role, joined_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
          [projectId, req.user.id, 'admin']
        );
        console.log(`✅ Auto-added creator ${req.user.id} to project ${projectId}`);
      } catch (insertError) {
        // If duplicate, check again
        const [retryMembers] = await pool.execute(
          'SELECT role FROM project_users WHERE project_id = ? AND user_id = ?',
          [projectId, req.user.id]
        );
        if (retryMembers.length === 0) {
          console.error('Failed to auto-add creator:', insertError);
          return res.status(403).json({ error: 'Access denied: You are not a member of this project' });
        }
      }
    } else {
      return res.status(403).json({ error: 'Access denied: You are not a member of this project' });
    }
  }
  
  // Continue with task creation
  try {
    const {
      title,
      description,
      project_id,
      assignee_id,
      priority,
      status,
      due_date,
      parent_task_id
    } = req.body;

    // Clean up empty strings to null
    const cleanDueDate = due_date && due_date.trim() !== '' ? due_date : null;
    const cleanAssigneeId = assignee_id && assignee_id !== '' && assignee_id !== null ? parseInt(assignee_id) : null;

    console.log('[CreateTask] Inserting task with:', { project_id, cleanDueDate, cleanAssigneeId });

    const [result] = await pool.execute(`
      INSERT INTO tasks (
        title, description, project_id, assignee_id, priority, 
        status, due_date, parent_task_id, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      RETURNING id
    `, [
      title, description, project_id, cleanAssigneeId, priority,
      status, cleanDueDate, parent_task_id || null, req.user.id
    ]);

    const taskId = result[0].id;

    // Get the created task with user details
    const [tasks] = await pool.execute(`
      SELECT 
        t.*,
        u.name as assignee_name,
        u.avatar as assignee_avatar,
        creator.name as creator_name,
        creator.avatar as creator_avatar
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN users creator ON t.created_by = creator.id
      WHERE t.id = ?
    `, [taskId]);

    // Emit real-time update
    if (req.io) {
      req.io.to(`project_${project_id}`).emit('task_created', tasks[0]);
    }

    res.status(201).json(tasks[0]);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['todo', 'in_progress', 'review', 'done']),
  body('due_date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    
    // Check if user is a member of the project that owns this task
    const membershipCheck = await checkTaskProjectMembership(id, req.user.id);
    if (!membershipCheck.isMember) {
      return res.status(membershipCheck.error === 'Task not found' ? 404 : 403).json({ 
        error: membershipCheck.error 
      });
    }
    const updates = req.body;
    const updateFields = [];
    const values = [];

    // Build dynamic update query
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'id') {
        updateFields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);

    await pool.execute(`
      UPDATE tasks 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, values);

    // Get updated task
    const [tasks] = await pool.execute(`
      SELECT 
        t.*,
        u.name as assignee_name,
        u.avatar as assignee_avatar,
        creator.name as creator_name,
        creator.avatar as creator_avatar
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN users creator ON t.created_by = creator.id
      WHERE t.id = ?
    `, [id]);

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Emit real-time update
    if (req.io) {
      req.io.to(`project_${tasks[0].project_id}`).emit('task_updated', tasks[0]);
    }

    res.json(tasks[0]);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is a member of the project that owns this task
    const membershipCheck = await checkTaskProjectMembership(id, req.user.id);
    if (!membershipCheck.isMember) {
      return res.status(membershipCheck.error === 'Task not found' ? 404 : 403).json({ 
        error: membershipCheck.error 
      });
    }

    // Get task details before deletion for real-time update
    const [tasks] = await pool.execute('SELECT project_id FROM tasks WHERE id = ?', [id]);
    
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);

    // Emit real-time update
    if (req.io) {
      req.io.to(`project_${tasks[0].project_id}`).emit('task_deleted', { id: parseInt(id) });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload file attachment to task
router.post('/:id/attachments', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    
    // Save file metadata to database
    // In production, files should be stored in cloud storage (S3, Cloudinary, etc.)
    const [result] = await pool.execute(`
      INSERT INTO task_attachments (task_id, user_id, filename, original_name, file_path, file_size, mime_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      RETURNING id
    `, [
      id, 
      req.user.id, 
      originalname, 
      originalname, 
      `uploads/${Date.now()}-${originalname}`, // Mock file path
      size, 
      mimetype
    ]);

    const attachmentId = result[0].id;

    // Get task project for real-time update
    const [tasks] = await pool.execute('SELECT project_id FROM tasks WHERE id = ?', [id]);
    
    if (tasks.length > 0 && req.io) {
      req.io.to(`project_${tasks[0].project_id}`).emit('task_attachment_added', {
        taskId: parseInt(id),
        attachment: {
          id: attachmentId,
          original_name: originalname,
          file_size: size,
          mime_type: mimetype,
          created_at: new Date().toISOString()
        }
      });
    }

    res.status(201).json({
      id: attachmentId,
      original_name: originalname,
      file_size: size,
      mime_type: mimetype,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment to task
router.post('/:id/comments', [
  body('content').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { content } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO task_comments (task_id, user_id, content, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      RETURNING id
    `, [id, req.user.id, content]);

    const commentId = result[0].id;

    // Get comment with user details
    const [comments] = await pool.execute(`
      SELECT 
        c.*,
        u.name as author_name,
        u.avatar as author_avatar
      FROM task_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [commentId]);

    // Get task project for real-time update
    const [tasks] = await pool.execute('SELECT project_id FROM tasks WHERE id = ?', [id]);
    
    if (tasks.length > 0 && req.io) {
      req.io.to(`project_${tasks[0].project_id}`).emit('task_comment_added', {
        taskId: parseInt(id),
        comment: comments[0]
      });
    }

    res.status(201).json(comments[0]);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
