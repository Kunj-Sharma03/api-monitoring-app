require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cron = require('node-cron');
const LOG_CLEANUP_DAYS = parseInt(process.env.LOG_CLEANUP_DAYS || '7');
const apiLimiter = require('./middleware/rateLimiter');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const monitorRoutes = require('./routes/monitor');
const analyticsRoutes = require('./routes/analytics');
const checkMonitors = require('./services/monitorWorker');
const { pool } = require('./db');
const validateEnv = require('./utils/validateEnv');
validateEnv();

const app = express();
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

const PORT = process.env.PORT || 5000;

connectWithRetry().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
