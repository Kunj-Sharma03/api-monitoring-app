// Load environment variables (Railway provides them automatically, fallback to .env for local)
require('dotenv').config({ silent: true });

// Debug: Check what environment variables Railway is providing
console.log('🔍 Railway Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'EXISTS' : 'MISSING');
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'EXISTS' : 'MISSING');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? 'EXISTS' : 'MISSING');
console.log('Environment variables count:', Object.keys(process.env).filter(key => !key.startsWith('npm_')).length);

// List all env vars starting with our expected names
const ourVars = Object.keys(process.env).filter(key => 
  key.startsWith('DATABASE_') || 
  key.startsWith('GOOGLE_') || 
  key.startsWith('JWT_') ||
  key.startsWith('EMAIL_') ||
  key.startsWith('BREVO_')
);
console.log('Our variables found:', ourVars);

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cron = require('node-cron');
const LOG_CLEANUP_DAYS = parseInt(process.env.LOG_CLEANUP_DAYS || '7');
const DISABLE_CRONS = (process.env.DISABLE_CRONS || '').toLowerCase() === 'true' || process.env.DISABLE_CRONS === '1';
const apiLimiter = require('./middleware/rateLimiter');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const monitorRoutes = require('./routes/monitor');
const analyticsRoutes = require('./routes/analytics');
const checkMonitors = require('./services/monitorWorker');
const { pool } = require('./db');

// Validate environment with graceful error handling
try {
  const validateEnv = require('./utils/validateEnv');
  validateEnv();
  console.log('✅ Environment validation passed');
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  console.log('⚠️  Continuing with defaults...');
}

const app = express();

// Trust proxy for Railway (needed for rate limiting and getting real client IPs)
app.set('trust proxy', true);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // Set to true if using HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// 🌐 Root route
app.get('/', (req, res) => {
  res.send('API is working!');
});

// 🛡️ Apply rate limiter to all /api routes
app.use('/api', apiLimiter);

// 📦 Routes
app.use('/api', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/analytics', analyticsRoutes);

// ⏱️ Cron monitor check (runs every minute)
if (DISABLE_CRONS) {
  console.log('⏸️ Cron jobs are disabled via DISABLE_CRONS env var');
} else {
  let isChecking = false;

  cron.schedule('* * * * *', async () => {
    if (isChecking) return console.warn('⚠️ Skipping check: previous still running');

    isChecking = true;
    console.log('⏱️ Running scheduled monitor check...');
    try {
      await pool.query('SELECT 1'); // DB ping
      await checkMonitors().catch(err => console.error('🚨 Monitor job failed:', err.message));
    } catch (err) {
      console.error('🔌 Monitor check failed:', err.message);
    } finally {
      isChecking = false;
    }
  });

  // 🧹 Daily cleanup: delete monitor_logs older than LOG_CLEANUP_DAYS
  cron.schedule('0 0 * * *', async () => {
    console.log(`🧹 Cleaning up logs older than ${LOG_CLEANUP_DAYS} days...`);
    try {
      const result = await pool.query(
        `DELETE FROM monitor_logs WHERE timestamp < NOW() - INTERVAL '${LOG_CLEANUP_DAYS} days' RETURNING id`
      );
      console.log(`✅ Deleted ${result.rowCount} old logs`);
    } catch (err) {
      console.error('❌ Log cleanup failed:', err.message);
    }
  });
}


// 🔁 Retry DB connection on startup
async function connectWithRetry(retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ DB connected successfully');
      return;
    } catch (err) {
      console.error(`❌ DB connection failed (attempt ${i + 1}):`, err.message);
      if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
    }
  }
  console.warn('⚠️ Starting server without DB connection.');
}

// 🧨 Handle global unhandled DB rejections
process.on('unhandledRejection', (err) => {
  console.error('🧨 Unhandled DB error:', err.message);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('🧨 Uncaught Exception:', err.message);
  console.error(err.stack);
});

// Log exit signals and beforeExit to diagnose silent shutdowns
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM. Shutting down gracefully...');
});
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT. Shutting down...');
});
process.on('beforeExit', (code) => {
  console.log('⚠️ beforeExit event with code:', code);
});
process.on('exit', (code) => {
  console.log('👋 Process exiting with code:', code);
});

const PORT = process.env.PORT || 5000;

// Start server with or without database connection
async function startServer() {
  try {
    console.log('🚀 Starting server...');
    
    // Try to connect to database but don't fail if it doesn't work
    try {
      await connectWithRetry(3, 2000);
    } catch (dbError) {
      console.warn('⚠️  Database connection failed, but starting server anyway');
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
  // Lightweight heartbeat to confirm the process stays alive
  setInterval(() => console.log('💓 heartbeat', new Date().toISOString()), 60_000);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
