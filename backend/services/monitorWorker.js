const { pool, safeQuery } = require('../db');
const axios = require('axios');
const sendEmail = require('../utils/sendEmail');
const generateAlertPDF = require('../utils/generateAlertPDF');
const fs = require('fs');
const os = require('os');

// Use dynamic import for p-limit since it's an ES module
let pLimit;
const initPLimit = async () => {
  if (!pLimit) {
    const module = await import('p-limit');
    pLimit = module.default;
  }
  return pLimit;
};

const COOLDOWN_MINUTES = 30;

function isCooldownActive(lastSent) {
  if (!lastSent) return false;
  const lastTime = new Date(lastSent);
  const now = new Date();
  const diffInMinutes = (now - lastTime) / (1000 * 60);
  return diffInMinutes < COOLDOWN_MINUTES;
}

async function sendAlert(monitor, status, logDetails, prevStatus) {
  try {
    const userRes = await safeQuery(
      `SELECT email FROM users WHERE id = $1`,
      [monitor.user_id]
    );
    const userEmail = userRes.rows[0]?.email;
    if (!userEmail) return;

    const subject = `⚠️ Monitor Alert: ${monitor.url} is ${status}`;
    const text = `
🔔 Your API Monitor triggered an alert!

🌐 URL: ${monitor.url}
📅 Checked At (UTC): ${new Date().toISOString()}
📈 Status: ${status}
📊 Previous Status: ${prevStatus || 'N/A'}
🔢 HTTP Code: ${logDetails.statusCode}
⏱ Response Time: ${logDetails.responseTime} ms

📝 Reason: Status changed from ${prevStatus} to ${status}
🖥 Host: ${os.hostname()}

See attached report for more details.
    `.trim();

    const pdfPath = await generateAlertPDF({ monitor, status, logDetails, prevStatus });
    await sendEmail(userEmail, subject, text, pdfPath);

    fs.unlink(pdfPath, () => {}); // delete temp file

    console.log(`📧 PDF Alert sent to ${userEmail}`);
  } catch (err) {
    console.error('❌ Failed to send alert with PDF:', err);
  }
}

async function checkMonitors() {
  try {
    // Initialize pLimit if not already done
    const limitFunc = await initPLimit();
    const limit = limitFunc(2);

    const { rows: monitors } = await safeQuery(
      `SELECT * FROM monitors WHERE is_active = true`
    );

    const now = new Date();
    await Promise.all(
      monitors.map((monitor) =>
        limit(async () => {
          // Only check if enough time has passed since last_checked_at
          const lastChecked = monitor.last_checked_at ? new Date(monitor.last_checked_at) : null;
          const intervalMs = monitor.interval_minutes * 60 * 1000;
          if (lastChecked && now - lastChecked < intervalMs) {
            return; // Skip this monitor, not time yet
          }

          const start = Date.now();
          let status = 'DOWN';
          let statusCode = 0;
          let errorMessage = null;

          try {
            const res = await axios.get(monitor.url, { timeout: 10000 });
            status = res.status >= 200 && res.status < 400 ? 'UP' : 'DOWN';
            statusCode = res.status;
          } catch (err) {
            try {
              const retry = await axios.get(monitor.url, { timeout: 10000 });
              status = retry.status >= 200 && retry.status < 400 ? 'UP' : 'DOWN';
              statusCode = retry.status;
            } catch (retryErr) {
              status = 'DOWN';
              statusCode = retryErr.response?.status || 0;
              if (retryErr.response) {
                errorMessage = `HTTP ${statusCode} - ${retryErr.response.statusText}`;
              } else if (retryErr.request) {
                errorMessage = 'No response received (timeout or network issue)';
              } else {
                errorMessage = retryErr.message;
              }
            }
          }

          const responseTime = Date.now() - start;
          const logDetails = { statusCode, responseTime, errorMessage };

          try {
            const previous = await safeQuery(
              `SELECT status FROM monitor_logs WHERE monitor_id = $1 ORDER BY timestamp DESC LIMIT 1`,
              [monitor.id]
            );
            const prevStatus = previous.rows[0]?.status;

            await safeQuery(
              `INSERT INTO monitor_logs (monitor_id, status, response_time, status_code)
               VALUES ($1, $2, $3, $4)`,
              [monitor.id, status, responseTime, statusCode]
            );

            await safeQuery(
              `UPDATE monitors SET last_checked_at = NOW() WHERE id = $1`,
              [monitor.id]
            );

            if (prevStatus && prevStatus !== status) {
              if (isCooldownActive(monitor.last_alert_sent_at)) {
                console.log(`⏳ Alert skipped for ${monitor.url} (cooldown active)`);
              } else {
                await sendAlert(monitor, status, logDetails, prevStatus);
                await safeQuery(
                  `INSERT INTO alerts (monitor_id, reason, error_message)
                   VALUES ($1, $2, $3)`,
                  [
                    monitor.id,
                    `Status changed from ${prevStatus} to ${status}`,
                    errorMessage,
                  ]
                );
                await safeQuery(
                  `UPDATE monitors
                   SET last_alert_sent_at = NOW(),
                       status_change_count = status_change_count + 1
                   WHERE id = $1`,
                  [monitor.id]
                );
              }
            }
            console.log(`✅ Checked ${monitor.url} → ${status} (${statusCode})`);
          } catch (err) {
            console.error(`❌ Monitor processing error (${monitor.url}):`, err.message);
          }
        })
      )
    );
  } catch (err) {
    console.error('❌ Monitor check error:', err.message);
  }
}

module.exports = checkMonitors;
