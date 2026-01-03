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

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, name, created_at) VALUES (?, ?, ?, NOW())',
      [email, hashedPassword, name]
    );

    const userId = result.insertId;

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
        avatar: null
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, password, name, avatar, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  console.log('🔵 Google OAuth initiated');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', 
  (req, res, next) => {
    console.log('🟢 Google OAuth callback received');
    console.log('   Query params:', req.query);
    
    // Get clean client URL
    let clientUrl = process.env.CLIENT_URL || 'http://localhost:8080';
    clientUrl = clientUrl.trim().replace(/\/+$/, ''); // Remove trailing slashes
    
    console.log('   CLIENT_URL:', clientUrl);
    
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        console.error('❌ Google OAuth error in callback:', err);
        console.error('   Error message:', err.message);
        console.error('   Error code:', err.code);
        console.error('   Error stack:', err.stack);
        return res.redirect(`${clientUrl}/login?error=google_auth_failed&msg=${encodeURIComponent(err.message || 'Unknown error')}`);
      }
      
      if (!user) {
        console.error('❌ Google OAuth: No user returned');
        console.error('   Info:', JSON.stringify(info, null, 2));
        console.error('   Error:', info?.message || 'No error message');
        return res.redirect(`${clientUrl}/login?error=no_user&info=${encodeURIComponent(JSON.stringify(info || {}))}`);
      }
      
      console.log('✅ Google OAuth successful, user:', user.id);
      
      try {
        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '7d' }
        );
        
        console.log('   Redirecting to callback with token');
        res.redirect(`${clientUrl}/auth/callback?token=${token}`);
      } catch (error) {
        console.error('❌ Google OAuth token generation error:', error);
        res.redirect(`${clientUrl}/login?error=google_callback_error`);
      }
    })(req, res, next);
  }
);

// GitHub OAuth routes
router.get('/github', (req, res, next) => {
  console.log('🔵 GitHub OAuth initiated');
  console.log('   CLIENT_URL:', process.env.CLIENT_URL);
  console.log('   GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? 'Set' : 'Missing');
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

router.get('/github/callback',
  (req, res, next) => {
    console.log('🟢 GitHub OAuth callback received');
    console.log('   Query params:', req.query);
    
    // Get clean client URL
    let clientUrl = process.env.CLIENT_URL || 'http://localhost:8080';
    clientUrl = clientUrl.trim().replace(/\/+$/, ''); // Remove trailing slashes
    
    console.log('   CLIENT_URL:', clientUrl);
    
    passport.authenticate('github', { session: false }, (err, user, info) => {
      if (err) {
        console.error('❌ GitHub OAuth error:', err);
        console.error('   Error message:', err.message);
        return res.redirect(`${clientUrl}/login?error=github_auth_failed`);
      }
      
      if (!user) {
        console.error('❌ GitHub OAuth: No user returned');
        console.error('   Info:', info);
        return res.redirect(`${clientUrl}/login?error=no_user`);
      }
      
      console.log('✅ GitHub OAuth successful, user:', user.id);
      
      try {
        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '7d' }
        );
        
        console.log('   Redirecting to callback with token');
        res.redirect(`${clientUrl}/auth/callback?token=${token}`);
      } catch (error) {
        console.error('❌ GitHub OAuth token generation error:', error);
        res.redirect(`${clientUrl}/login?error=github_callback_error`);
      }
    })(req, res, next);
  }
);

module.exports = router;
