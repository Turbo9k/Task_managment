const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (PostgreSQL - use RETURNING to get the ID)
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, name, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) RETURNING id, created_at',
      [email, hashedPassword, name]
    );

    const userId = result[0].id;
    const createdAt = result[0].created_at;

    // Generate JWT
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: userId,
        email,
        name,
        avatar: null,
        created_at: createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.email);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    let users;
    try {
      [users] = await pool.execute(
        'SELECT id, email, password, name, avatar, is_active, created_at FROM users WHERE email = ?',
        [email]
      );
      console.log('Login query result:', {
        email: email,
        usersFound: users.length,
        userId: users.length > 0 ? users[0].id : null,
        isActive: users.length > 0 ? users[0].is_active : null,
        hasPassword: users.length > 0 ? !!users[0].password : false
      });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      console.error('Error code:', dbError.code);
      console.error('Error message:', dbError.message);
      console.error('Error stack:', dbError.stack);
      
      // Return detailed error for debugging
      return res.status(500).json({ 
        error: 'Database error occurred',
        message: dbError.message,
        code: dbError.code,
        ...(process.env.NODE_ENV === 'development' && { 
          stack: dbError.stack 
        })
      });
    }

    if (users.length === 0) {
      console.log('Login failed: User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    if (!user.is_active) {
      console.log('Login failed: Account deactivated for user:', user.id);
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check password
    if (!user.password) {
      console.log('Login failed: No password set for user:', user.id);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password check result:', {
      userId: user.id,
      email: user.email,
      isValid: isValidPassword,
      passwordLength: user.password ? user.password.length : 0
    });
    
    if (!isValidPassword) {
      console.log('Login failed: Invalid password for user:', user.id);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    console.log('Login successful for user:', user.id);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, name, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: users[0].id,
        email: users[0].email,
        name: users[0].name,
        avatar: users[0].avatar,
        created_at: users[0].created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    const clientUrl = process.env.CLIENT_URL || (
      process.env.NODE_ENV === 'production'
        ? 'https://task-managment-mauve.vercel.app'
        : 'http://localhost:8080'
    );
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  }
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    const clientUrl = process.env.CLIENT_URL || (
      process.env.NODE_ENV === 'production'
        ? 'https://task-managment-mauve.vercel.app'
        : 'http://localhost:8080'
    );
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  }
);

module.exports = router;
