const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

const router = express.Router();

// Get all users (for project member selection)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT id, name, email, avatar FROM users WHERE is_active = 1';
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
  body('avatar').optional().isURL()
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
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `, values);

    // Get updated user
    const [users] = await pool.execute(
      'SELECT id, email, name, avatar FROM users WHERE id = ?',
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
        CONCAT('Completed task: ', t.title) as description,
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
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN t.assignee_id = ? THEN t.id END) as assigned_tasks,
        COUNT(DISTINCT CASE WHEN t.assignee_id = ? AND t.status = 'done' THEN t.id END) as completed_tasks,
        COUNT(DISTINCT p.id) as projects_count,
        COUNT(DISTINCT CASE WHEN pu.role = 'admin' THEN p.id END) as admin_projects
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN project_users pu ON p.id = pu.project_id AND pu.user_id = ?
    `, [req.user.id, req.user.id, req.user.id]);

    res.json(stats[0]);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
