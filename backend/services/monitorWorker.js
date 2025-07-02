const pool = require('../db');
const axios = require('axios');

async function checkMonitors() {
  try {
    const { rows: monitors } = await pool.query(
      `SELECT * FROM monitors WHERE is_active = true`
    );

    for (const monitor of monitors) {
      const start = Date.now();
      let status;
      let statusCode;
      let responseTime;

      try {
        const res = await axios.get(monitor.url, { timeout: 5000 });
        status = 'UP';
        statusCode = res.status;
      } catch (err) {
        status = 'DOWN';
        statusCode = err.response?.status || 0;
      }

      responseTime = Date.now() - start;

      await pool.query(
        `INSERT INTO monitor_logs (monitor_id, status, status_code, response_time)
         VALUES ($1, $2, $3, $4)`,
        [monitor.id, status, statusCode, responseTime]
      );

      console.log(`Checked ${monitor.url} → ${status} (${statusCode}) in ${responseTime}ms`);
    }
  } catch (err) {
    console.error('Monitor check error:', err);
  }
}

module.exports = checkMonitors;
