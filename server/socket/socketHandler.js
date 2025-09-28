const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const initializeSocket = (io) => {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      
      // Verify user exists and is active
      const [users] = await pool.execute(
        'SELECT id, email, name, avatar FROM users WHERE id = ? AND is_active = 1',
        [decoded.userId]
      );

      if (users.length === 0) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = decoded.userId;
      socket.user = users[0];
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`👤 User ${socket.user.name} connected (${socket.id})`);

    // Join project rooms
    socket.on('join_project', async (projectId) => {
      try {
        // Verify user has access to project
        const [projectUsers] = await pool.execute(
          'SELECT role FROM project_users WHERE user_id = ? AND project_id = ?',
          [socket.userId, projectId]
        );

        if (projectUsers.length === 0) {
          socket.emit('error', { message: 'Access denied to project' });
          return;
        }

        socket.join(`project_${projectId}`);
        console.log(`👤 User ${socket.user.name} joined project ${projectId}`);
        
        // Notify others in the project
        socket.to(`project_${projectId}`).emit('user_joined', {
          user: socket.user,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Join project error:', error);
        socket.emit('error', { message: 'Failed to join project' });
      }
    });

    // Leave project rooms
    socket.on('leave_project', (projectId) => {
      socket.leave(`project_${projectId}`);
      console.log(`👤 User ${socket.user.name} left project ${projectId}`);
      
      // Notify others in the project
      socket.to(`project_${projectId}`).emit('user_left', {
        user: socket.user,
        timestamp: new Date().toISOString()
      });
    });

    // Handle task updates
    socket.on('task_editing', async (data) => {
      try {
        const { taskId, projectId, isEditing } = data;
        
        // Verify user has access to project
        const [projectUsers] = await pool.execute(
          'SELECT role FROM project_users WHERE user_id = ? AND project_id = ?',
          [socket.userId, projectId]
        );

        if (projectUsers.length === 0) {
          return;
        }

        // Notify others in the project about editing status
        socket.to(`project_${projectId}`).emit('task_editing_status', {
          taskId,
          user: socket.user,
          isEditing,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Task editing error:', error);
      }
    });

    // Handle real-time typing in comments
    socket.on('comment_typing', async (data) => {
      try {
        const { taskId, projectId, isTyping } = data;
        
        // Verify user has access to project
        const [projectUsers] = await pool.execute(
          'SELECT role FROM project_users WHERE user_id = ? AND project_id = ?',
          [socket.userId, projectId]
        );

        if (projectUsers.length === 0) {
          return;
        }

        // Notify others in the project about typing status
        socket.to(`project_${projectId}`).emit('comment_typing_status', {
          taskId,
          user: socket.user,
          isTyping,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Comment typing error:', error);
      }
    });

    // Handle online status
    socket.on('update_status', (status) => {
      socket.userStatus = status;
      // Broadcast status to all connected clients
      socket.broadcast.emit('user_status_changed', {
        userId: socket.userId,
        status,
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`👤 User ${socket.user.name} disconnected (${socket.id})`);
      
      // Notify all projects the user was in
      socket.rooms.forEach(room => {
        if (room.startsWith('project_')) {
          socket.to(room).emit('user_left', {
            user: socket.user,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
  });

  // Make io available to routes for emitting events
  io.emitToProject = (projectId, event, data) => {
    io.to(`project_${projectId}`).emit(event, data);
  };

  return io;
};

module.exports = { initializeSocket };
