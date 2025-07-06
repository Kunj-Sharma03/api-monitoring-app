const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db');
const generateAlertPDF = require('../utils/generateAlertpdf');
const path = require('path');
const fs = require('fs');

// Create a new monitor
router.post('/create', auth, async (req, res) => {
  const { url, interval_minutes, alert_threshold } = req.body;

  if (!url) {
    return res.status(400).json({ msg: 'URL is required' });
  }

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

// Get all monitors for a user
router.get('/all', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM monitors WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({ monitors: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update a monitor
router.put('/:id/update', auth, async (req, res) => {
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

// Get logs for a specific monitor
router.get('/:id/logs', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const logs = await pool.query(
      `SELECT * FROM monitor_logs WHERE monitor_id = $1 ORDER BY timestamp DESC LIMIT 20`,
      [id]
    );

    res.json({ logs: logs.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch logs' });
  }
});

// Get recent alerts for a monitor
router.get('/:id/alerts', auth, async (req, res) => {
  const { id } = req.params;

  try {
    // Ensure the monitor belongs to the user
    const monitor = await pool.query(
      `SELECT * FROM monitors WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (monitor.rowCount === 0) {
      return res.status(404).json({ msg: 'Monitor not found or not owned by user' });
    }

    const alerts = await pool.query(
      `SELECT * FROM alerts WHERE monitor_id = $1 ORDER BY triggered_at DESC LIMIT 10`,
      [id]
    );

    res.json({ alerts: alerts.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error fetching alerts' });
  }
});

router.get('/:monitorId/alert/:alertId/pdf', async (req, res) => {
  const { monitorId, alertId } = req.params;

  try {
    // 1. Fetch monitor and alert details
    const monitorRes = await pool.query('SELECT * FROM monitors WHERE id = $1', [monitorId]);
    const alertRes = await pool.query('SELECT * FROM alerts WHERE id = $1', [alertId]);

    const logRes = await pool.query(`
      SELECT * FROM monitor_logs 
      WHERE monitor_id = $1 
      ORDER BY timestamp DESC LIMIT 1
    `, [monitorId]);

    const monitor = monitorRes.rows[0];
    const alert = alertRes.rows[0];
    const log = logRes.rows[0]; 

    if (!monitor || !alert || !log) return res.status(404).json({ error: 'Data not found' });

    // 2. Generate PDF
    const pdfPath = await generateAlertPDF({
      monitor,
      status: log.status,
      logDetails: {
        statusCode: log.status_code,
        responseTime: log.response_time,
      },
      prevStatus: alert.reason?.includes('from') ? alert.reason.split(' ')[2] : 'UNKNOWN',
    });

    // 3. Send the PDF
    res.download(pdfPath, `alert-${alertId}.pdf`, (err) => {
      fs.unlink(pdfPath, () => {}); // Cleanup temp file
    });

  } catch (err) {
    console.error('❌ Error generating alert PDF:', err.message);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});


module.exports = router;
