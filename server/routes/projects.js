const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { requireRole } = require('../middleware/auth');
const { requireProjectMember, requireProjectRole } = require('../middleware/projectAuth');

const router = express.Router();

// Get all projects for user
router.get('/', async (req, res) => {
  try {
    const [projects] = await pool.execute(`
      SELECT 
        p.*,
        pu.role,
        COUNT(DISTINCT t.id) as task_count,
        COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks
      FROM projects p
      LEFT JOIN project_users pu ON p.id = pu.project_id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE pu.user_id = ?
      GROUP BY p.id, pu.role
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project with details - requires project membership
router.get('/:id', requireProjectMember, async (req, res) => {
  try {
    const { id } = req.params;

    // Get project details (user is already verified as member by middleware)
    const [projects] = await pool.execute(`
      SELECT 
        p.*,
        pu.role
      FROM projects p
      LEFT JOIN project_users pu ON p.id = pu.project_id
      WHERE p.id = ? AND pu.user_id = ?
    `, [id, req.user.id]);

    if (projects.length === 0) {
      // This shouldn't happen if middleware works correctly, but safety check
      return res.status(403).json({ error: 'Access denied: Project not found or you are not a member' });
    }

    const project = projects[0];

    // Get project members
    const [members] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.avatar, pu.role, pu.joined_at
      FROM project_users pu
      LEFT JOIN users u ON pu.user_id = u.id
      WHERE pu.project_id = ?
      ORDER BY pu.joined_at ASC
    `, [id]);

    // Get project statistics
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'review' THEN 1 END) as review_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as done_tasks,
        COUNT(CASE WHEN due_date < CURRENT_TIMESTAMP AND status != 'done' THEN 1 END) as overdue_tasks
      FROM tasks
      WHERE project_id = ?
    `, [id]);

    // Get recent activity
    const [activity] = await pool.execute(`
      SELECT 
        'task_created' as type,
        t.title as description,
        u.name as user_name,
        u.avatar as user_avatar,
        t.created_at as timestamp
      FROM tasks t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.project_id = ?
      
      UNION ALL
      
      SELECT 
        'task_updated' as type,
        CONCAT('Updated task: ', t.title) as description,
        u.name as user_name,
        u.avatar as user_avatar,
        t.updated_at as timestamp
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.project_id = ? AND t.updated_at > t.created_at
      
      ORDER BY timestamp DESC
      LIMIT 20
    `, [id, id]);

    res.json({
      ...project,
      members,
      stats: stats[0],
      activity
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create project
router.post('/', [
  body('name').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('color').optional().isHexColor()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, color } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO projects (name, description, color, created_by, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      RETURNING id
    `, [name, description, color || '#3B82F6', req.user.id]);

    const projectId = result[0].id;

    // Add creator as admin
    await pool.execute(`
      INSERT INTO project_users (project_id, user_id, role, joined_at)
      VALUES (?, ?, 'admin', CURRENT_TIMESTAMP)
    `, [projectId, req.user.id]);

    // Get created project
    const [projects] = await pool.execute(`
      SELECT 
        p.*,
        'admin' as role
      FROM projects p
      WHERE p.id = ?
    `, [projectId]);

    res.status(201).json(projects[0]);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project - requires admin role
router.put('/:id', requireProjectMember, requireProjectRole(['admin']), [
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('color').optional().isHexColor()
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
      UPDATE projects 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, values);

    // Get updated project
    const [projects] = await pool.execute(`
      SELECT 
        p.*,
        pu.role
      FROM projects p
      LEFT JOIN project_users pu ON p.id = pu.project_id
      WHERE p.id = ? AND pu.user_id = ?
    `, [id, req.user.id]);

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Emit real-time update
    req.io.to(`project_${id}`).emit('project_updated', projects[0]);

    res.json(projects[0]);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add member to project - requires admin role
router.post('/:id/members', requireProjectMember, requireProjectRole(['admin']), [
  body('email').isEmail().normalizeEmail(),
  body('role').isIn(['admin', 'member', 'viewer'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { email, role } = req.body;

    // Find user by email
    const [users] = await pool.execute(
      'SELECT id, name, email, avatar FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Check if user is already a member
    const [existingMembers] = await pool.execute(
      'SELECT id FROM project_users WHERE project_id = ? AND user_id = ?',
      [id, user.id]
    );

    if (existingMembers.length > 0) {
      return res.status(400).json({ error: 'User is already a member of this project' });
    }

    // Add user to project
    await pool.execute(`
      INSERT INTO project_users (project_id, user_id, role, joined_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `, [id, user.id, role]);

    // Emit real-time update
    req.io.to(`project_${id}`).emit('member_added', {
      ...user,
      role,
      joined_at: new Date().toISOString()
    });

    res.status(201).json({
      ...user,
      role,
      joined_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove member from project - requires admin role
router.delete('/:id/members/:userId', requireProjectMember, requireProjectRole(['admin']), async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Don't allow removing the last admin
    const [admins] = await pool.execute(
      'SELECT COUNT(*) as admin_count FROM project_users WHERE project_id = ? AND role = "admin"',
      [id]
    );

    if (admins[0].admin_count <= 1) {
      return res.status(400).json({ error: 'Cannot remove the last admin' });
    }

    await pool.execute(
      'DELETE FROM project_users WHERE project_id = ? AND user_id = ?',
      [id, userId]
    );

    // Emit real-time update
    req.io.to(`project_${id}`).emit('member_removed', { userId: parseInt(userId) });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project - requires admin role
router.delete('/:id', requireProjectMember, requireProjectRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Delete project (cascade will handle related records)
    await pool.execute('DELETE FROM projects WHERE id = ?', [id]);

    // Emit real-time update
    req.io.to(`project_${id}`).emit('project_deleted', { id: parseInt(id) });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
