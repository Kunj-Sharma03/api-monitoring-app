const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db');

// 📊 Get overview analytics
router.get('/overview', auth, async (req, res) => {
  const { range = '7d' } = req.query;
  
  try {
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (range) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get total monitors for user
    const totalMonitorsRes = await pool.query(
      'SELECT COUNT(*) as count FROM monitors WHERE user_id = $1',
      [req.user.id]
    );
    const totalMonitors = parseInt(totalMonitorsRes.rows[0].count);

    // Get active monitors (recently checked)
    const activeMonitorsRes = await pool.query(
      `SELECT COUNT(*) as count FROM monitors 
       WHERE user_id = $1 AND is_active = true 
       AND last_checked_at > $2`,
      [req.user.id, new Date(now.getTime() - 10 * 60 * 1000)] // Active in last 10 minutes
    );
    const activeMonitors = parseInt(activeMonitorsRes.rows[0].count);

    // Calculate average uptime for the time range
    const uptimeRes = await pool.query(
      `SELECT 
         COUNT(CASE WHEN ml.status = 'UP' THEN 1 END) as up_count,
         COUNT(*) as total_count
       FROM monitor_logs ml
       JOIN monitors m ON ml.monitor_id = m.id
       WHERE m.user_id = $1 AND ml.timestamp >= $2`,
      [req.user.id, startDate]
    );
    
    const upCount = parseInt(uptimeRes.rows[0].up_count || 0);
    const totalCount = parseInt(uptimeRes.rows[0].total_count || 0);
    const avgUptime = totalCount > 0 ? (upCount / totalCount) * 100 : 100;

    // Get total alerts in time range
    const alertsRes = await pool.query(
      `SELECT COUNT(*) as count FROM alerts a
       JOIN monitors m ON a.monitor_id = m.id
       WHERE m.user_id = $1 AND a.triggered_at >= $2`,
      [req.user.id, startDate]
    );
    const totalAlerts = parseInt(alertsRes.rows[0].count);

    // Calculate average response time
    const responseTimeRes = await pool.query(
      `SELECT AVG(ml.response_time) as avg_response_time
       FROM monitor_logs ml
       JOIN monitors m ON ml.monitor_id = m.id
       WHERE m.user_id = $1 AND ml.timestamp >= $2 AND ml.response_time IS NOT NULL`,
      [req.user.id, startDate]
    );
    const avgResponseTime = Math.round(responseTimeRes.rows[0].avg_response_time || 0);

    // Count downtime events (alerts = incidents)
    const downtimeEvents = totalAlerts; // Since each alert represents an incident

    console.log('Analytics Overview Data:', {
      totalMonitors,
      activeMonitors,
      avgUptime,
      totalAlerts,
      avgResponseTime,
      downtimeEvents
    });

    res.json({
      totalMonitors,
      activeMonitors,
      averageUptime: Math.round(avgUptime * 100) / 100,
      totalAlerts,
      averageResponseTime: avgResponseTime,
      activeIncidents: downtimeEvents
    });
  } catch (err) {
    console.error('Error fetching overview analytics:', err);
    res.status(500).json({ msg: 'Server error fetching analytics' });
  }
});

// 📈 Get uptime history
router.get('/uptime-history', auth, async (req, res) => {
  const { range = '7d' } = req.query;
  
  try {
    const now = new Date();
    let startDate, sqlInterval;
    
    switch (range) {
      case '24h':
        sqlInterval = 'hour';
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        sqlInterval = 'day';
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        sqlInterval = 'day';
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        sqlInterval = 'day';
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        sqlInterval = 'day';
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const result = await pool.query(
      `SELECT 
         date_trunc('${sqlInterval}', ml.timestamp) as time_bucket,
         COUNT(CASE WHEN ml.status = 'UP' THEN 1 END)::float / COUNT(*)::float * 100 as uptime_percent
       FROM monitor_logs ml
       JOIN monitors m ON ml.monitor_id = m.id
       WHERE m.user_id = $1 AND ml.timestamp >= $2
       GROUP BY date_trunc('${sqlInterval}', ml.timestamp)
       ORDER BY time_bucket`,
      [req.user.id, startDate]
    );

    console.log('Uptime History Query Result:', result.rows.length, 'rows');

    res.json({
      data: result.rows.map(row => ({
        time_bucket: row.time_bucket,
        uptime_percent: Math.round((row.uptime_percent || 100) * 100) / 100
      }))
    });
  } catch (err) {
    console.error('Error fetching uptime history:', err);
    res.status(500).json({ msg: 'Server error fetching uptime history' });
  }
});

// ⚡ Get response time history
router.get('/response-time', auth, async (req, res) => {
  const { range = '7d' } = req.query;
  
  try {
    const now = new Date();
    let startDate, sqlInterval;
    
    switch (range) {
      case '24h':
        sqlInterval = 'hour';
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        sqlInterval = 'hour';
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        sqlInterval = 'day';
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        sqlInterval = 'day';
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        sqlInterval = 'hour';
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const result = await pool.query(
      `SELECT 
         date_trunc('${sqlInterval}', ml.timestamp) as time_bucket,
         AVG(ml.response_time) as avg_response_time
       FROM monitor_logs ml
       JOIN monitors m ON ml.monitor_id = m.id
       WHERE m.user_id = $1 AND ml.timestamp >= $2 AND ml.response_time IS NOT NULL
       GROUP BY date_trunc('${sqlInterval}', ml.timestamp)
       ORDER BY time_bucket`,
      [req.user.id, startDate]
    );

    console.log('Response Time Query Result:', result.rows.length, 'rows');

    res.json({
      data: result.rows.map(row => ({
        time_bucket: row.time_bucket,
        avg_response_time: Math.round(row.avg_response_time || 0)
      }))
    });
  } catch (err) {
    console.error('Error fetching response time history:', err);
    res.status(500).json({ msg: 'Server error fetching response time history' });
  }
});

// 🚨 Get alerts history
router.get('/alerts-history', auth, async (req, res) => {
  const { range = '7d' } = req.query;
  
  try {
    const now = new Date();
    let startDate;
    
    switch (range) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const result = await pool.query(
      `SELECT 
         DATE(a.triggered_at) as time_bucket,
         COUNT(*) as alert_count
       FROM alerts a
       JOIN monitors m ON a.monitor_id = m.id
       WHERE m.user_id = $1 AND a.triggered_at >= $2
       GROUP BY DATE(a.triggered_at)
       ORDER BY time_bucket`,
      [req.user.id, startDate]
    );

    console.log('Alerts History Query Result:', result.rows.length, 'rows');

    res.json({
      data: result.rows.map(row => ({
        time_bucket: row.time_bucket,
        alert_count: parseInt(row.alert_count || 0)
      }))
    });
  } catch (err) {
    console.error('Error fetching alerts history:', err);
    res.status(500).json({ msg: 'Server error fetching alerts history' });
  }
});

module.exports = router;
