const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

const router = express.Router();

// Get all users (for project member selection)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT id, name, email, avatar FROM users WHERE is_active = TRUE';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name ASC LIMIT 20';

    const [users] = await pool.execute(query, params);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2 }),
  body('avatar').optional().custom((value) => {
    // Allow URLs, blob URLs, and data URLs
    if (!value) return true;
    if (typeof value !== 'string') return false;
    // Check if it's a valid URL, blob URL, or data URL
    try {
      if (value.startsWith('blob:') || value.startsWith('data:')) {
        return true;
      }
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }).withMessage('Avatar must be a valid URL, blob URL, or data URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, avatar } = req.body;
    const updateFields = [];
    const values = [];

    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (avatar) {
      updateFields.push('avatar = ?');
      values.push(avatar);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(req.user.id);

    await pool.execute(`
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, values);

    // Get updated user
    const [users] = await pool.execute(
      'SELECT id, email, name, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json(users[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user activity
router.get('/activity', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const [activity] = await pool.execute(`
      SELECT 
        'task_created' as type,
        t.title as description,
        p.name as project_name,
        p.color as project_color,
        t.created_at as timestamp
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.created_by = ?
      
      UNION ALL
      
      SELECT 
        'task_completed' as type,
        ('Completed task: ' || t.title) as description,
        p.name as project_name,
        p.color as project_color,
        t.updated_at as timestamp
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.assignee_id = ? AND t.status = 'done' AND t.updated_at > t.created_at
      
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, req.user.id, parseInt(limit), parseInt(offset)]);

    res.json(activity);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    // Get tasks assigned to user
    const [assignedTasks] = await pool.execute(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks
      FROM tasks t
      INNER JOIN project_users pu ON t.project_id = pu.project_id
      WHERE t.assignee_id = ? AND pu.user_id = ?
    `, [req.user.id, req.user.id]);

    // Get projects count
    const [projectsCount] = await pool.execute(`
      SELECT COUNT(DISTINCT project_id) as projects_count
      FROM project_users
      WHERE user_id = ?
    `, [req.user.id]);

    const stats = {
      totalTasks: parseInt(assignedTasks[0]?.total_tasks || 0),
      completedTasks: parseInt(assignedTasks[0]?.completed_tasks || 0),
      inProgressTasks: parseInt(assignedTasks[0]?.in_progress_tasks || 0),
      projectsCount: parseInt(projectsCount[0]?.projects_count || 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

module.exports = router;
