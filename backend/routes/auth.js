const express = require('express');
// Prefer native bcrypt; gracefully fall back to bcryptjs to avoid native crashes
let _bcryptLib;
try {
  _bcryptLib = require('bcrypt');
} catch (e) {
  console.warn('⚠️ bcrypt native failed to load, falling back to bcryptjs:', e.message);
  _bcryptLib = require('bcryptjs');
}
const bcrypt = {
  hash: (password, saltRounds) => new Promise((resolve, reject) =>
    _bcryptLib.hash(password, saltRounds, (err, hash) => (err ? reject(err) : resolve(hash)))
  ),
  compare: (password, hash) => new Promise((resolve, reject) =>
    _bcryptLib.compare(password, hash, (err, same) => (err ? reject(err) : resolve(same)))
  ),
};
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const router = express.Router();

// Passport Google OAuth setup
if (!process.env.GOOGLE_CLIENT_ID) {
  console.log('⚠️ Google OAuth disabled - missing environment variables');
} else {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      // Find or create user in DB
      const email = profile.emails[0].value;
      let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      let user = userResult.rows[0];
      if (!user) {
        // Create user if not exists
        const newUserResult = await pool.query(
          'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
          [email, null]
        );
        user = newUserResult.rows[0];
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, userResult.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth routes
if (process.env.GOOGLE_CLIENT_ID) {
  router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), async (req, res) => {
    // Issue JWT after successful OAuth login
    const user = req.user;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Redirect to frontend callback with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  });
} else {
  router.get('/auth/google', (_req, res) => res.status(503).json({ msg: 'Google OAuth not configured' }));
  router.get('/auth/google/callback', (_req, res) => res.status(503).json({ msg: 'Google OAuth not configured' }));
}

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });


    res.json({ token, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
