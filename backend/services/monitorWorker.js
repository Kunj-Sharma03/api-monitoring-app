const { pool, safeQuery } = require('../db');
const axios = require('axios');
const sendEmail = require('../utils/sendEmail');
const generateAlertPDF = require('../utils/generateAlertpdf');
const fs = require('fs');
const pLimit = require('p-limit').default; // Add at top with other imports
const limit = pLimit(2); // Adjust concurrency as needed



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

See attached report for more details.
    `.trim();

    const pdfPath = await generateAlertPDF({ monitor, status, logDetails, prevStatus });
    await sendEmail(userEmail, subject, text, pdfPath);

    fs.unlink(pdfPath, () => {}); // Clean temp file after sending

    console.log(`📧 PDF Alert sent to ${userEmail}`);
  } catch (err) {
    console.error('❌ Failed to send alert with PDF:', err);
  }
}


async function checkMonitors() {
  try {
    const { rows: monitors } = await safeQuery(
      `SELECT * FROM monitors WHERE is_active = true`
    );

    await Promise.all(
      monitors.map((monitor) =>
        limit(async () => {
          const start = Date.now();
          let status = 'DOWN';
          let statusCode = 0;

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
            }
          }

          const responseTime = Date.now() - start;
          const logDetails = { statusCode, responseTime };

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

            if (prevStatus && prevStatus !== status) {
              await sendAlert(monitor, status, logDetails, prevStatus);
              await safeQuery(
                `INSERT INTO alerts (monitor_id, reason)
                 VALUES ($1, $2)`,
                [monitor.id, `Status changed from ${prevStatus} to ${status}`]
              );
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
