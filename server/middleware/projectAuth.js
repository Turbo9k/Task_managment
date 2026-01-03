const { pool } = require('../config/database');

/**
 * Middleware to ensure user is a member of the project
 * Returns 403 if user is not a member (not 404 for security)
 */
const requireProjectMember = async (req, res, next) => {
  try {
    // Check multiple possible locations for project ID
    const projectId = req.params.id || 
                      req.params.projectId || 
                      req.body.projectId || 
                      req.body.project_id;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Check if user is a member of the project
    const [members] = await pool.execute(
      'SELECT role FROM project_users WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (members.length === 0) {
      // Check if user is the project creator - if so, auto-add them
      const [projects] = await pool.execute(
        'SELECT created_by FROM projects WHERE id = ?',
        [projectId]
      );
      
      if (projects.length > 0 && projects[0].created_by === req.user.id) {
        // User is the creator but not in project_users - add them
        try {
          await pool.execute(
            'INSERT INTO project_users (project_id, user_id, role, joined_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
            [projectId, req.user.id, 'admin']
          );
          console.log(`Auto-added project creator ${req.user.id} to project ${projectId}`);
          req.userProjectRole = 'admin';
          return next();
        } catch (insertError) {
          // If insert fails (e.g., duplicate), try to get existing membership
          const [retryMembers] = await pool.execute(
            'SELECT role FROM project_users WHERE project_id = ? AND user_id = ?',
            [projectId, req.user.id]
          );
          if (retryMembers.length > 0) {
            req.userProjectRole = retryMembers[0].role;
            return next();
          }
        }
      }
      
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







