const { pool } = require('../config/database');

/**
 * Middleware to ensure user is a member of the project
 * Returns 403 if user is not a member (not 404 for security)
 */
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Check if user is a member of the project
    const [members] = await pool.execute(
      'SELECT role FROM project_users WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (members.length === 0) {
      // Return 403 (Forbidden) instead of 404 to prevent information disclosure
      console.log(`Access denied: User ${req.user.id} attempted to access project ${projectId}`);
      return res.status(403).json({ 
        error: 'Access denied: You are not a member of this project' 
      });
    }

    // Attach user's role in the project to the request
    req.userProjectRole = members[0].role;
    next();
  } catch (error) {
    console.error('Project membership check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to require specific role(s) in the project
 * Must be used after requireProjectMember
 */
const requireProjectRole = (roles) => {
  return (req, res, next) => {
    if (!req.userProjectRole) {
      return res.status(500).json({ error: 'Project role not set. Use requireProjectMember first.' });
    }

    if (!roles.includes(req.userProjectRole)) {
      return res.status(403).json({ 
        error: 'Access denied: Insufficient permissions for this action' 
      });
    }

    next();
  };
};

module.exports = { requireProjectMember, requireProjectRole };



