const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const { pool } = require('../config/database');
const { requireRole } = require('../middleware/auth');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const router = express.Router();

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
        creator.avatar as creator_avatar
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN users creator ON t.created_by = creator.id
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
  body('due_date').optional().isISO8601()
], requireRole(['admin', 'member']), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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

    const [result] = await pool.execute(`
      INSERT INTO tasks (
        title, description, project_id, assignee_id, priority, 
        status, due_date, parent_task_id, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      title, description, project_id, assignee_id, priority,
      status, due_date || null, parent_task_id || null, req.user.id
    ]);

    const taskId = result.insertId;

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
    req.io.to(`project_${project_id}`).emit('task_created', tasks[0]);

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
      SET ${updateFields.join(', ')}, updated_at = NOW()
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
    req.io.to(`project_${tasks[0].project_id}`).emit('task_updated', tasks[0]);

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

    // Get task details before deletion for real-time update
    const [tasks] = await pool.execute('SELECT project_id FROM tasks WHERE id = ?', [id]);
    
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);

    // Emit real-time update
    req.io.to(`project_${tasks[0].project_id}`).emit('task_deleted', { id: parseInt(id) });

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
    
    // In a real application, you'd save the file to cloud storage
    // For demo purposes, we'll just store the metadata
    const [result] = await pool.execute(`
      INSERT INTO task_attachments (task_id, user_id, filename, original_name, file_path, file_size, mime_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      id, 
      req.user.id, 
      originalname, 
      originalname, 
      `uploads/${Date.now()}-${originalname}`, // Mock file path
      size, 
      mimetype
    ]);

    const attachmentId = result.insertId;

    // Get task project for real-time update
    const [tasks] = await pool.execute('SELECT project_id FROM tasks WHERE id = ?', [id]);
    
    if (tasks.length > 0) {
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
      VALUES (?, ?, ?, NOW())
    `, [id, req.user.id, content]);

    const commentId = result.insertId;

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
    
    if (tasks.length > 0) {
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
