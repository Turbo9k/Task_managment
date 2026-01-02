const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool configuration
// Support both connection string and individual parameters
let dbConfig;

if (process.env.DATABASE_URL) {
  // Use connection string if provided (common with Neon)
  // Ensure SSL is required in connection string
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString.includes('sslmode=')) {
    connectionString += (connectionString.includes('?') ? '&' : '?') + 'sslmode=require';
  }
  
  dbConfig = {
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Neon
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
} else {
  // Use individual parameters
  // Neon requires SSL in production
  const requiresSSL = process.env.NODE_ENV === 'production' || 
                      process.env.DB_HOST?.includes('neon.tech') ||
                      process.env.DB_SSL === 'true';
  
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'task_management',
    port: process.env.DB_PORT || 5432,
    ssl: requiresSSL ? { 
      rejectUnauthorized: false,
      require: true 
    } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

console.log('Database config:', {
  host: dbConfig.host || (dbConfig.connectionString ? new URL(dbConfig.connectionString).hostname : 'N/A'),
  user: dbConfig.user || (dbConfig.connectionString ? new URL(dbConfig.connectionString).username : 'from connection string'),
  database: dbConfig.database || (dbConfig.connectionString ? new URL(dbConfig.connectionString).pathname.replace('/', '') : 'from connection string'),
  ssl: dbConfig.ssl ? 'enabled' : 'disabled',
  usingConnectionString: !!dbConfig.connectionString
});

const pool = new Pool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    console.log('   Database time:', result.rows[0].now);
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    // Don't exit in serverless - just log the error
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Handle connection errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === '57P01') {
    console.error('Database connection was terminated.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

// Helper function to execute queries (compatible with MySQL style)
pool.execute = async (query, params = []) => {
  try {
    // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
    let pgQuery = query;
    let paramIndex = 1;
    const pgParams = [];
    
    // Replace ? with $1, $2, etc. (but not in strings or comments)
    // Simple replacement - be careful with edge cases
    pgQuery = pgQuery.replace(/\?/g, (match, offset, string) => {
      // Check if we're inside a string (simple check)
      const before = string.substring(0, offset);
      const singleQuotes = (before.match(/'/g) || []).length;
      const doubleQuotes = (before.match(/"/g) || []).length;
      
      // If odd number of quotes before, we're inside a string - don't replace
      if (singleQuotes % 2 === 1 || doubleQuotes % 2 === 1) {
        return match;
      }
      
      if (paramIndex <= params.length) {
        pgParams.push(params[paramIndex - 1]);
        return `$${paramIndex++}`;
      }
      return match;
    });
    
    // Add timeout to query
    const queryPromise = pool.query(pgQuery, pgParams);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 10000)
    );
    
    const result = await Promise.race([queryPromise, timeoutPromise]);
    // Return in MySQL-compatible format: [rows, fields]
    return [result.rows, result.fields || []];
  } catch (error) {
    console.error('Query execution error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error hint:', error.hint);
    console.error('Query that failed:', query.substring(0, 200));
    if (error.message === 'Query timeout') {
      throw new Error('Database query timed out. Please try again.');
    }
    // Re-throw with more context
    const enhancedError = new Error(`Database query failed: ${error.message}`);
    enhancedError.code = error.code;
    enhancedError.detail = error.detail;
    throw enhancedError;
  }
};

module.exports = { pool, testConnection };
