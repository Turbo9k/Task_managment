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
    
    // Convert to integer to ensure type consistency
    const projectIdInt = projectId ? parseInt(projectId) : null;
    
    console.log(`[ProjectAuth] Checking membership - User: ${req.user.id}, Project: ${projectIdInt}, Source: ${req.params.id ? 'params.id' : req.params.projectId ? 'params.projectId' : req.body.projectId ? 'body.projectId' : 'body.project_id'}`);
    
    if (!projectIdInt || isNaN(projectIdInt)) {
      console.log(`[ProjectAuth] No valid project ID found`);
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Check if user is a member of the project
    const [members] = await pool.execute(
      'SELECT role FROM project_users WHERE project_id = ? AND user_id = ?',
      [projectIdInt, req.user.id]
    );

    console.log(`[ProjectAuth] Membership check result: ${members.length} members found`);

    if (members.length === 0) {
      // Check if user is the project creator - if so, auto-add them
      const [projects] = await pool.execute(
        'SELECT created_by FROM projects WHERE id = ?',
        [projectIdInt]
      );
      
      console.log(`[ProjectAuth] Project lookup: ${projects.length} projects found, creator: ${projects[0]?.created_by}`);
      
      if (projects.length > 0 && parseInt(projects[0].created_by) === parseInt(req.user.id)) {
        // User is the creator but not in project_users - add them
        console.log(`[ProjectAuth] User is creator, auto-adding to project_users...`);
        try {
          await pool.execute(
            'INSERT INTO project_users (project_id, user_id, role, joined_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
            [projectIdInt, req.user.id, 'admin']
          );
          console.log(`[ProjectAuth] ✅ Auto-added project creator ${req.user.id} to project ${projectIdInt}`);
          req.userProjectRole = 'admin';
          return next();
        } catch (insertError) {
          console.log(`[ProjectAuth] Insert error: ${insertError.message}, code: ${insertError.code}`);
          // If insert fails (e.g., duplicate), try to get existing membership
          const [retryMembers] = await pool.execute(
            'SELECT role FROM project_users WHERE project_id = ? AND user_id = ?',
            [projectIdInt, req.user.id]
          );
          if (retryMembers.length > 0) {
            console.log(`[ProjectAuth] ✅ Found existing membership after retry`);
            req.userProjectRole = retryMembers[0].role;
            return next();
          }
          console.log(`[ProjectAuth] ❌ Failed to add creator and no existing membership found`);
        }
      } else {
        console.log(`[ProjectAuth] User is NOT the creator (creator: ${projects[0]?.created_by}, user: ${req.user.id})`);
      }
      
      // Return 403 (Forbidden) instead of 404 to prevent information disclosure
      console.log(`[ProjectAuth] ❌ Access denied: User ${req.user.id} attempted to access project ${projectIdInt}`);
      return res.status(403).json({ 
        error: 'Access denied: You are not a member of this project' 
      });
    }

    // Attach user's role in the project to the request
    req.userProjectRole = members[0].role;
    console.log(`[ProjectAuth] ✅ User is member with role: ${members[0].role}`);
    next();
  } catch (error) {
    console.error('[ProjectAuth] ❌ Error:', error);
    console.error('[ProjectAuth] Stack:', error.stack);
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







