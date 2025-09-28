const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { pool } = require('./database');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { id, displayName, emails, photos } = profile;
    const email = emails[0].value;
    const avatar = photos[0]?.value;

    // Check if user exists
    let [users] = await pool.execute(
      'SELECT id, email, name, avatar FROM users WHERE email = ?',
      [email]
    );

    if (users.length > 0) {
      // Update user info if needed
      await pool.execute(
        'UPDATE users SET name = ?, avatar = ?, updated_at = NOW() WHERE id = ?',
        [displayName, avatar, users[0].id]
      );
      
      users[0].name = displayName;
      users[0].avatar = avatar;
      return done(null, users[0]);
    }

    // Create new user
    const [result] = await pool.execute(`
      INSERT INTO users (email, name, avatar, provider, provider_id, is_active, created_at)
      VALUES (?, ?, ?, 'google', ?, 1, NOW())
    `, [email, displayName, avatar, id]);

    const newUser = {
      id: result.insertId,
      email,
      name: displayName,
      avatar
    };

    return done(null, newUser);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/api/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { id, displayName, username, photos, emails } = profile;
    const email = emails?.[0]?.value || `${username}@github.local`;
    const avatar = photos[0]?.value;
    const name = displayName || username;

    // Check if user exists
    let [users] = await pool.execute(
      'SELECT id, email, name, avatar FROM users WHERE email = ? OR (provider = "github" AND provider_id = ?)',
      [email, id]
    );

    if (users.length > 0) {
      // Update user info if needed
      await pool.execute(
        'UPDATE users SET name = ?, avatar = ?, updated_at = NOW() WHERE id = ?',
        [name, avatar, users[0].id]
      );
      
      users[0].name = name;
      users[0].avatar = avatar;
      return done(null, users[0]);
    }

    // Create new user
    const [result] = await pool.execute(`
      INSERT INTO users (email, name, avatar, provider, provider_id, is_active, created_at)
      VALUES (?, ?, ?, 'github', ?, 1, NOW())
    `, [email, name, avatar, id]);

    const newUser = {
      id: result.insertId,
      email,
      name,
      avatar
    };

    return done(null, newUser);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, name, avatar FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length > 0) {
      return done(null, users[0]);
    }
    
    return done(null, false);
  } catch (error) {
    console.error('Deserialize user error:', error);
    return done(error, null);
  }
});

module.exports = passport;
