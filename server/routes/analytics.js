const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user analytics
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 30 } = req.query; // days
    
    const periodDate = new Date();
    periodDate.setDate(periodDate.getDate() - parseInt(period));

    // Tasks completed
    const [completedTasks] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM tasks t
      INNER JOIN project_users pu ON t.project_id = pu.project_id
      WHERE pu.user_id = ? 
        AND t.status = 'done'
        AND t.updated_at >= ?
    `, [userId, periodDate]);

    // Total tasks assigned
    const [totalTasks] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM tasks t
      INNER JOIN project_users pu ON t.project_id = pu.project_id
      WHERE pu.user_id = ? 
        AND t.assignee_id = ?
        AND t.created_at >= ?
    `, [userId, userId, periodDate]);

    // Calculate productivity score (completion rate)
    const productivityScore = totalTasks[0].count > 0 
      ? Math.round((completedTasks[0].count / totalTasks[0].count) * 100)
      : 0;

    // Average task completion time (in hours)
    const [avgTime] = await pool.execute(`
      SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as avg_hours
      FROM tasks t
      INNER JOIN project_users pu ON t.project_id = pu.project_id
      WHERE pu.user_id = ? 
        AND t.status = 'done'
        AND t.updated_at >= ?
        AND t.updated_at > t.created_at
    `, [userId, periodDate]);

    // Goal achievement (tasks completed vs tasks due)
    const [goals] = await pool.execute(`
      SELECT 
        COUNT(*) as total_due,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_due
      FROM tasks t
      INNER JOIN project_users pu ON t.project_id = pu.project_id
      WHERE pu.user_id = ? 
        AND t.assignee_id = ?
        AND t.due_date IS NOT NULL
        AND t.due_date >= ?
    `, [userId, userId, periodDate]);

    const goalAchievement = goals[0].total_due > 0
      ? Math.round((goals[0].completed_due / goals[0].total_due) * 100)
      : 0;

    res.json({
      tasksCompleted: completedTasks[0].count,
      productivityScore: Math.min(productivityScore, 100),
      avgTaskTime: avgTime[0].avg_hours ? parseFloat(avgTime[0].avg_hours).toFixed(1) : 0,
      goalAchievement: Math.min(goalAchievement, 100)
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project progress
router.get('/projects', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [projects] = await pool.execute(`
      SELECT 
        p.id,
        p.name,
        p.color,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'done' THEN 1 END) as completed_tasks,
        CASE 
          WHEN COUNT(t.id) > 0 
          THEN ROUND((COUNT(CASE WHEN t.status = 'done' THEN 1 END)::numeric / COUNT(t.id)::numeric) * 100)
          ELSE 0
        END as progress
      FROM projects p
      INNER JOIN project_users pu ON p.id = pu.project_id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE pu.user_id = ?
      GROUP BY p.id, p.name, p.color
      ORDER BY p.created_at DESC
      LIMIT 10
    `, [userId]);

    res.json(projects);
  } catch (error) {
    console.error('Project analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get team performance
router.get('/team', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all users from projects the current user is in
    const [teamMembers] = await pool.execute(`
      SELECT DISTINCT
        u.id,
        u.name,
        u.avatar,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN t.status = 'done' AND t.assignee_id = u.id THEN 1 END) as completed_tasks,
        CASE 
          WHEN COUNT(DISTINCT t.id) > 0 
          THEN ROUND((COUNT(DISTINCT CASE WHEN t.status = 'done' AND t.assignee_id = u.id THEN 1 END)::numeric / COUNT(DISTINCT t.id)::numeric) * 100)
          ELSE 0
        END as completion_rate
      FROM users u
      INNER JOIN project_users pu1 ON u.id = pu1.user_id
      INNER JOIN project_users pu2 ON pu1.project_id = pu2.project_id
      LEFT JOIN tasks t ON pu1.project_id = t.project_id
      WHERE pu2.user_id = ? AND u.id != ?
      GROUP BY u.id, u.name, u.avatar
      HAVING COUNT(DISTINCT t.id) > 0
      ORDER BY completion_rate DESC, total_tasks DESC
      LIMIT 10
    `, [userId, userId]);

    res.json(teamMembers.map(member => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      tasks: parseInt(member.total_tasks),
      completion: parseInt(member.completion_rate)
    })));
  } catch (error) {
    console.error('Team analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get time distribution (by project)
router.get('/time-distribution', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 30 } = req.query;
    
    const periodDate = new Date();
    periodDate.setDate(periodDate.getDate() - parseInt(period));

    const [distribution] = await pool.execute(`
      SELECT 
        p.name,
        p.color,
        COUNT(t.id) as task_count,
        ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(t.updated_at, CURRENT_TIMESTAMP) - t.created_at)) / 3600)) as avg_hours
      FROM projects p
      INNER JOIN project_users pu ON p.id = pu.project_id
      LEFT JOIN tasks t ON p.id = t.project_id AND t.assignee_id = ? AND t.created_at >= ?
      WHERE pu.user_id = ?
      GROUP BY p.id, p.name, p.color
      HAVING COUNT(t.id) > 0
      ORDER BY task_count DESC
      LIMIT 5
    `, [userId, periodDate, userId]);

    const colors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'];
    res.json(distribution.map((item, index) => ({
      name: item.name,
      hours: parseInt(item.avg_hours) || 0,
      color: item.color || colors[index % colors.length]
    })));
  } catch (error) {
    console.error('Time distribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activity
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const [activity] = await pool.execute(`
      SELECT 
        'task' as type,
        ('Completed "' || t.title || '" task') as description,
        t.updated_at as timestamp
      FROM tasks t
      INNER JOIN project_users pu ON t.project_id = pu.project_id
      WHERE pu.user_id = ? 
        AND t.status = 'done'
        AND t.assignee_id = ?
      
      UNION ALL
      
      SELECT 
        'project' as type,
        ('Updated "' || p.name || '" project') as description,
        p.updated_at as timestamp
      FROM projects p
      INNER JOIN project_users pu ON p.id = pu.project_id
      WHERE pu.user_id = ? 
        AND p.updated_at > p.created_at
      
      ORDER BY timestamp DESC
      LIMIT ?
    `, [userId, userId, userId, parseInt(limit)]);

    res.json(activity.map(item => ({
      ...item,
      time: formatTimeAgo(item.timestamp)
    })));
  } catch (error) {
    console.error('Activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function formatTimeAgo(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return date.toLocaleDateString();
}

module.exports = router;

