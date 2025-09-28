const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Verify user still exists and is active
    const [users] = await pool.execute(
      'SELECT id, email, name, avatar, is_active FROM users WHERE id = ? AND is_active = 1',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const [projectUsers] = await pool.execute(
        'SELECT role FROM project_users WHERE user_id = ? AND project_id = ?',
        [req.user.id, req.params.projectId || req.body.projectId]
      );

      if (projectUsers.length === 0) {
        return res.status(403).json({ error: 'Access denied: Not a project member' });
      }

      const userRole = projectUsers[0].role;
      if (!roles.includes(userRole)) {
        return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
      }

      req.userRole = userRole;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = { authenticateToken, requireRole };
