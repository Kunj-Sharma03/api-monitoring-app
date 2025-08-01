const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db');
const { generateAlertPDF } = require('../utils/generateAlertPDF');
const path = require('path');
const fs = require('fs');

// 🔍 Validation rules
const monitorValidation = [
  body('url').isURL().withMessage('Valid URL is required'),
  body('interval_minutes')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Interval must be between 1 and 60'),
  body('alert_threshold')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Alert threshold must be between 1 and 10'),
];

// 🛠️ Create a new monitor
router.post('/create', auth, monitorValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { url, interval_minutes, alert_threshold } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO monitors (user_id, url, interval_minutes, alert_threshold)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, url, interval_minutes || 5, alert_threshold || 3]
    );

    res.status(201).json({ monitor: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 🔁 Update monitor
router.put('/:id/update', auth, monitorValidation, async (req, res) => {
  console.log('🔧 Reached PUT /:id/update');
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const { url, interval_minutes, alert_threshold, is_active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE monitors 
       SET url = $1, interval_minutes = $2, alert_threshold = $3, is_active = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [url, interval_minutes, alert_threshold, is_active, id, req.user.id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ msg: 'Monitor not found or not owned by user' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 📊 Get logs (paginated)
router.get('/:id/logs', auth, async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const logsQuery = await pool.query(
      `SELECT * FROM monitor_logs 
       WHERE monitor_id = $1 
       ORDER BY timestamp DESC 
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const countQuery = await pool.query(
      `SELECT COUNT(*) FROM monitor_logs WHERE monitor_id = $1`,
      [id]
    );

    res.json({
      logs: logsQuery.rows,
      page,
      limit,
      total: parseInt(countQuery.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch logs' });
  }
});

// 🔔 Get alerts (paginated)
router.get('/:id/alerts', auth, async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const monitor = await pool.query(
      `SELECT * FROM monitors WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (monitor.rowCount === 0) {
      return res.status(404).json({ msg: 'Monitor not found or not owned by user' });
    }

    const alertsQuery = await pool.query(
      `SELECT * FROM alerts 
       WHERE monitor_id = $1 
       ORDER BY triggered_at DESC 
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const countQuery = await pool.query(
      `SELECT COUNT(*) FROM alerts WHERE monitor_id = $1`,
      [id]
    );

    res.json({
      alerts: alertsQuery.rows,
      page,
      limit,
      total: parseInt(countQuery.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error fetching alerts' });
  }
});

// 📄 Download alert PDF
router.get('/:monitorId/alert/:alertId/pdf', auth, async (req, res) => {
  const { monitorId, alertId } = req.params;

  try {
    const monitorRes = await pool.query('SELECT * FROM monitors WHERE id = $1', [monitorId]);
    const alertRes = await pool.query('SELECT * FROM alerts WHERE id = $1', [alertId]);
    const logRes = await pool.query(
      `SELECT * FROM monitor_logs WHERE monitor_id = $1 ORDER BY timestamp DESC LIMIT 1`,
      [monitorId]
    );

    const monitor = monitorRes.rows[0];
    const alert = alertRes.rows[0];
    const log = logRes.rows[0];

    if (!monitor || !alert || !log) return res.status(404).json({ error: 'Data not found' });

    const pdfPath = await generateAlertPDF({
      monitor,
      status: log.status,
      logDetails: {
        statusCode: log.status_code,
        responseTime: log.response_time,
      },
      prevStatus: alert.reason?.includes('from') ? alert.reason.split(' ')[2] : 'UNKNOWN',
    });

    res.download(pdfPath, `alert-${alertId}.pdf`, () => fs.unlink(pdfPath, () => {}));
  } catch (err) {
    console.error('❌ Error generating alert PDF:', err.message);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// 📋 Get all monitors for the logged-in user
router.get('/all', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        m.*,
        latest_log.status as latest_status,
        CASE 
          WHEN latest_log.status = 'UP' THEN true 
          WHEN latest_log.status = 'DOWN' THEN false 
          ELSE null 
        END as "isUp"
      FROM monitors m
      LEFT JOIN (
        SELECT DISTINCT ON (monitor_id) 
               monitor_id, status
        FROM monitor_logs
        ORDER BY monitor_id, timestamp DESC
      ) latest_log ON latest_log.monitor_id = m.id
      WHERE m.user_id = $1 
      ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    
    res.json({ monitors: result.rows });
  } catch (err) {
    console.error('Failed to fetch monitors:', err.message);
    res.status(500).json({ msg: 'Server error fetching monitors' });
  }
});

// 🧽 Delete monitor
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM monitors WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, req.user.id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ msg: 'Monitor not found or not owned by user' });

    res.json({ msg: 'Monitor deleted', monitor: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error deleting monitor' });
  }
});


router.get('/:id/stats', auth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Ensure monitor belongs to user
    const monitorCheck = await pool.query(
      'SELECT * FROM monitors WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (monitorCheck.rowCount === 0) {
      return res.status(404).json({ msg: 'Monitor not found or unauthorized' });
    }

    // Total logs and UP logs
    const { rows: logRows } = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE status_code BETWEEN 200 AND 299) AS up_count,
              COUNT(*) AS total_count,
              AVG(response_time) AS avg_response_time
       FROM monitor_logs
       WHERE monitor_id = $1`,
      [id]
    );

    const { up_count, total_count, avg_response_time } = logRows[0];
    const uptimePercent = total_count > 0 ? ((up_count / total_count) * 100).toFixed(2) : 0;

    // Total alerts
    const alertRes = await pool.query(
      'SELECT COUNT(*) FROM alerts WHERE monitor_id = $1',
      [id]
    );
    const totalAlerts = parseInt(alertRes.rows[0].count);

    // Last 20 logs (for latency chart)
    const recentLogsRes = await pool.query(
      `SELECT timestamp, response_time 
       FROM monitor_logs 
       WHERE monitor_id = $1
       ORDER BY timestamp DESC
       LIMIT 20`,
      [id]
    );

    res.json({
      uptimePercent,
      totalAlerts,
      avgResponseTime: Math.round(avg_response_time) || 0,
      lastLogs: recentLogsRes.rows.reverse(), // reverse to get oldest first
    });
  } catch (err) {
    console.error('Error in stats route:', err.message);
    res.status(500).json({ msg: 'Server error while fetching monitor stats' });
  }
});

// 🚨 Get all alerts for the logged-in user
router.get('/alerts', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, m.url AS monitor_url, ml.status AS status
       FROM alerts a
       JOIN monitors m ON a.monitor_id = m.id
       LEFT JOIN LATERAL (
         SELECT status FROM monitor_logs WHERE monitor_id = m.id ORDER BY timestamp DESC LIMIT 1
       ) ml ON true
       WHERE m.user_id = $1
       ORDER BY a.triggered_at DESC`,
      [req.user.id]
    );
    res.json({ alerts: result.rows });
  } catch (err) {
    console.error('Failed to fetch alerts:', err.message);
    res.status(500).json({ msg: 'Server error fetching alerts' });
  }
});

// 🧽 Delete alert
router.delete('/alert/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    // Find alert and ensure user owns the monitor
    const alertRes = await pool.query(
      `SELECT a.*, m.user_id FROM alerts a JOIN monitors m ON a.monitor_id = m.id WHERE a.id = $1`,
      [id]
    );
    if (alertRes.rowCount === 0 || alertRes.rows[0].user_id !== req.user.id) {
      return res.status(404).json({ msg: 'Alert not found or unauthorized' });
    }
    // Delete alert
    const delRes = await pool.query(`DELETE FROM alerts WHERE id = $1 RETURNING *`, [id]);
    res.json({ msg: 'Alert deleted', alert: delRes.rows[0] });
  } catch (err) {
    console.error('Error deleting alert:', err.message, err);
    res.status(500).json({ msg: 'Server error deleting alert', error: err.message });
  }
});

module.exports = router;
