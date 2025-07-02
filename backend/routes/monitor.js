const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../db');

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

module.exports = router;
