const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { pool } = require('./database');

// Construct callback URL
const getCallbackURL = (provider) => {
  // Check if we're on Vercel (has VERCEL env var) or in production
  const isVercel = !!process.env.VERCEL;
  const isProduction = process.env.NODE_ENV === 'production' || isVercel;
  
  if (isProduction) {
    // Vercel provides VERCEL_URL automatically, or use CLIENT_URL if set
    let baseUrl = process.env.CLIENT_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                   process.env.API_BASE_URL;
    
    // Fix common URL issues
    if (baseUrl) {
      // Clean up the URL - remove all whitespace
      baseUrl = baseUrl.trim();
      
      // Fix triple slashes or malformed URLs
      baseUrl = baseUrl.replace(/^https:\/\/+/, 'https://');
      baseUrl = baseUrl.replace(/^http:\/\/+/, 'http://');
      
      // Remove trailing slash
      baseUrl = baseUrl.replace(/\/+$/, '');
      
      // Only use if it looks like a valid URL
      if (baseUrl && (baseUrl.startsWith('http://') || baseUrl.startsWith('https://'))) {
        return `${baseUrl}/api/auth/${provider}/callback`;
      }
    }
  }
  
  // Development - use localhost
  return `http://localhost:${process.env.PORT || 3000}/api/auth/${provider}/callback`;
};

// Google OAuth Strategy
const googleCallbackURL = getCallbackURL('google');
console.log('🔐 Google OAuth callback URL:', googleCallbackURL);
console.log('   Make sure this EXACT URL is in your Google OAuth Console!');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: googleCallbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔐 Google profile received:', {
      id: profile.id,
      displayName: profile.displayName,
      emails: profile.emails?.map(e => e.value),
      hasPhotos: !!profile.photos?.[0]
    });
    
    const { id, displayName, emails, photos } = profile;
    const email = emails && emails[0] ? emails[0].value : null;
    
    if (!email) {
      console.error('❌ No email in Google profile');
      return done(new Error('No email found in Google profile'), null);
    }
    
    const avatar = photos && photos[0] ? photos[0].value : null;
    console.log('   Processing user with email:', email);

    // Check if user exists
    let [users] = await pool.execute(
      'SELECT id, email, name, avatar FROM users WHERE email = ?',
      [email]
    );

    if (users.length > 0) {
      console.log('   User exists, updating:', users[0].id);
      // Update user info if needed
      await pool.execute(
        'UPDATE users SET name = ?, avatar = ?, updated_at = NOW() WHERE id = ?',
        [displayName, avatar, users[0].id]
      );
      
      users[0].name = displayName;
      users[0].avatar = avatar;
      return done(null, users[0]);
    }

    console.log('   Creating new user');
    // Create new user
    const [result] = await pool.execute(`
      INSERT INTO users (email, name, avatar, provider, provider_id, is_active, created_at)
      VALUES (?, ?, ?, 'google', ?, true, NOW())
    `, [email, displayName, avatar, id]);

    const newUser = {
      id: result.insertId,
      email,
      name: displayName,
      avatar
    };

    console.log('   New user created:', newUser.id);
    return done(null, newUser);
  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    return done(error, null);
  }
}));

// GitHub OAuth Strategy
const githubCallbackURL = getCallbackURL('github');
console.log('🔐 GitHub OAuth callback URL:', githubCallbackURL);
console.log('   Make sure this EXACT URL is in your GitHub OAuth App settings!');

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: githubCallbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔐 GitHub profile received:', {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      hasEmail: !!profile.emails?.[0]?.value,
      hasAvatar: !!profile.photos?.[0]?.value
    });
    
    const { id, displayName, username, photos, emails, _json } = profile;
    
    // GitHub may not return email if it's private, try to get from _json or use a placeholder
    let email = emails?.[0]?.value;
    if (!email && _json?.email) {
      email = _json.email;
    }
    if (!email) {
      // Use a unique identifier based on GitHub ID
      email = `github_${id}@github.local`;
    }
    
    const avatar = photos && photos[0] ? photos[0].value : null;
    const name = displayName || username || `GitHub User ${id}`;

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
      VALUES (?, ?, ?, 'github', ?, true, NOW())
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
