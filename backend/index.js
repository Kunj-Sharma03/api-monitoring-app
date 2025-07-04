require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const monitorRoutes = require('./routes/monitor');
const checkMonitors = require('./services/monitorWorker');
const { pool } = require('./db'); // safeQuery and pool
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is working!');
});

let isChecking = false;

cron.schedule('* * * * *', async () => {
  if (isChecking) return console.warn('⚠️ Skipping check: previous still running');

  isChecking = true;
  console.log('⏱️ Running scheduled monitor check...');
  try {
    await pool.query('SELECT 1'); // quick DB check
    await checkMonitors();       // actual monitoring work
  } catch (err) {
    console.error('🔌 Monitor check failed:', err.message);
  } finally {
    isChecking = false;
  }
});

// ✅ Retry DB connection gracefully at startup
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

// Handle unhandled DB errors
process.on('unhandledRejection', (err) => {
  console.error('🧨 Unhandled DB error:', err.message);
});

const PORT = process.env.PORT || 5000;

app.use('/api', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/monitor', monitorRoutes);

// 👇 Connect to DB before starting server
connectWithRetry().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
