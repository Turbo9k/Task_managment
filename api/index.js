const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('dotenv').config();

// Initialize database connection first (for passport)
try {
  const { pool } = require('../server/config/database');
  console.log('Database pool initialized');
} catch (dbError) {
  console.error('Database initialization error:', dbError);
}

// Initialize Passport strategies (must be before routes)
try {
  require('../server/config/passport');
  console.log('Passport strategies initialized');
} catch (passportError) {
  console.error('Passport initialization error:', passportError);
}

// Log environment info (for debugging)
console.log('API Serverless Function Starting...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST ? 'Set' : 'Not set');
console.log('CLIENT_URL:', process.env.CLIENT_URL || 'Not set');

const authRoutes = require('../server/routes/auth');
const taskRoutes = require('../server/routes/tasks');
const projectRoutes = require('../server/routes/projects');
const userRoutes = require('../server/routes/users');
const analyticsRoutes = require('../server/routes/analytics');
const { authenticateToken } = require('../server/middleware/auth');

const app = express();

// Trust proxy - required for Vercel (handles X-Forwarded-For headers)
app.set('trust proxy', true);

// Security middleware - configure for CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - allow all origins for Vercel
app.use(cors({
  origin: true, // Allow all origins - Vercel handles security
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));

// Rate limiting - configured for Vercel (trust proxy is set above)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Passport middleware
app.use(passport.initialize());

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Original URL: ${req.originalUrl}`);
  console.log('Headers:', {
    origin: req.headers.origin,
    'user-agent': req.headers['user-agent']?.substring(0, 50),
    'content-type': req.headers['content-type']
  });
  next();
});

// Routes - Vercel passes the full path including /api, so we need to match /api/*
app.use('/api/auth', authRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);
app.use('/api/projects', authenticateToken, projectRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const { pool } = require('../server/config/database');
    const result = await pool.query('SELECT NOW() as time, version() as version');
    res.json({ 
      status: 'OK', 
      database: 'connected',
      time: result.rows[0].time,
      version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Task Management API',
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware (must be before catch-all)
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error on ${req.method} ${req.path}:`, err.message);
  console.error('Error name:', err.name);
  console.error('Error code:', err.code);
  console.error('Error stack:', err.stack);
  console.error('Request details:', {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    body: req.body,
    headers: {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      'content-type': req.headers['content-type']
    }
  });
  
  // Don't send stack trace in production
  const errorResponse = {
    error: err.message || 'Internal server error',
    path: req.path,
    method: req.method
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.name = err.name;
    errorResponse.code = err.code;
  }
  
  res.status(err.status || 500).json(errorResponse);
});

// Catch-all for debugging - shows what path was received (must be last)
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    message: 'Check server logs for available routes'
  });
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export the Express app as a serverless function
// Vercel will automatically handle this as a serverless function
module.exports = app;

