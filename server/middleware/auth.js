const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth middleware - Request:', {
    path: req.path,
    method: req.method,
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    tokenLength: token ? token.length : 0
  });

  if (!token) {
    console.log('Auth failed: No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    console.log('Verifying token with secret:', jwtSecret ? 'Set' : 'Not set');
    
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Token decoded successfully:', { userId: decoded.userId });
    
    // Verify user still exists and is active (PostgreSQL uses TRUE, not 1)
    const [users] = await pool.execute(
      'SELECT id, email, name, avatar, is_active FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    console.log('User lookup result:', {
      userId: decoded.userId,
      usersFound: users.length,
      isActive: users.length > 0 ? users[0].is_active : null
    });

    if (users.length === 0) {
      console.log('Auth failed: User not found or inactive');
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = users[0];
    console.log('Auth successful for user:', req.user.id);
    next();
  } catch (error) {
    console.error('Auth error:', {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt,
      path: req.path
    });
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
