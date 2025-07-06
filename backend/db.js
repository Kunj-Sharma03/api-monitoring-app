const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  keepAlive: true,
});

// Catch unexpected connection errors (like idle client shutdown)
pool.on('error', (err, client) => {
  console.error('💥 Unexpected error on idle PG client:', err.message || err);
});

async function safeQuery(query, params = [], retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await pool.query(query, params);
    } catch (err) {
      console.error(`🛑 DB query error (attempt ${i + 1}):`, err.message);
      if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('DB query failed after retries');
}

// Optional: auto cleanup old logs or alerts (e.g., every 7 days)
// setInterval(async () => {
//   try {
//     await pool.query(`DELETE FROM monitor_logs WHERE timestamp < NOW() - INTERVAL '7 days'`);
//     console.log('🧹 Old logs cleaned');
//   } catch (err) {
//     console.error('❌ Failed to clean logs:', err.message);
//   }
// }, 24 * 60 * 60 * 1000); // Run once a day

module.exports = { pool, safeQuery };
