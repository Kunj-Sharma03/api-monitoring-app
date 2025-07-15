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

    // Calculate trend changes (compare with previous period)
    const prevStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    
    const prevUptimeRes = await pool.query(
      `SELECT 
         COUNT(CASE WHEN ml.status = 'UP' THEN 1 END) as up_count,
         COUNT(*) as total_count
       FROM monitor_logs ml
       JOIN monitors m ON ml.monitor_id = m.id
       WHERE m.user_id = $1 AND ml.timestamp >= $2 AND ml.timestamp < $3`,
      [req.user.id, prevStartDate, startDate]
    );
    
    const prevUpCount = parseInt(prevUptimeRes.rows[0].up_count || 0);
    const prevTotalCount = parseInt(prevUptimeRes.rows[0].total_count || 0);
    const prevAvgUptime = prevTotalCount > 0 ? (prevUpCount / prevTotalCount) * 100 : 100;
    const uptimeChange = avgUptime - prevAvgUptime;

    const prevResponseTimeRes = await pool.query(
      `SELECT AVG(ml.response_time) as avg_response_time
       FROM monitor_logs ml
       JOIN monitors m ON ml.monitor_id = m.id
       WHERE m.user_id = $1 AND ml.timestamp >= $2 AND ml.timestamp < $3 AND ml.response_time IS NOT NULL`,
      [req.user.id, prevStartDate, startDate]
    );
    const prevAvgResponseTime = Math.round(prevResponseTimeRes.rows[0].avg_response_time || 0);
    const responseTimeChange = prevAvgResponseTime > 0 ? ((avgResponseTime - prevAvgResponseTime) / prevAvgResponseTime) * 100 : 0;

    const prevAlertsRes = await pool.query(
      `SELECT COUNT(*) as count FROM alerts a
       JOIN monitors m ON a.monitor_id = m.id
       WHERE m.user_id = $1 AND a.triggered_at >= $2 AND a.triggered_at < $3`,
      [req.user.id, prevStartDate, startDate]
    );
    const prevTotalAlerts = parseInt(prevAlertsRes.rows[0].count);
    const alertsChange = prevTotalAlerts > 0 ? ((totalAlerts - prevTotalAlerts) / prevTotalAlerts) * 100 : 0;

    res.json({
      totalMonitors,
      activeMonitors,
      avgUptime: Math.round(avgUptime * 100) / 100,
      totalAlerts,
      avgResponseTime,
      downtimeEvents,
      uptimeChange: Math.round(uptimeChange * 100) / 100,
      responseTimeChange: Math.round(responseTimeChange * 100) / 100,
      alertsChange: Math.round(alertsChange * 100) / 100
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
         date_trunc('${sqlInterval}', ml.timestamp) as timestamp,
         COUNT(CASE WHEN ml.status = 'UP' THEN 1 END)::float / COUNT(*)::float * 100 as uptime,
         COUNT(CASE WHEN ml.status = 'DOWN' THEN 1 END)::float / COUNT(*)::float * 100 as downtime
       FROM monitor_logs ml
       JOIN monitors m ON ml.monitor_id = m.id
       WHERE m.user_id = $1 AND ml.timestamp >= $2
       GROUP BY date_trunc('${sqlInterval}', ml.timestamp)
       ORDER BY timestamp`,
      [req.user.id, startDate]
    );

    res.json(result.rows.map(row => ({
      timestamp: row.timestamp,
      uptime: Math.round((row.uptime || 0) * 100) / 100,
      downtime: Math.round((row.downtime || 0) * 100) / 100
    })));
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
         date_trunc('${sqlInterval}', ml.timestamp) as timestamp,
         AVG(ml.response_time) as avg,
         PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ml.response_time) as p95,
         PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY ml.response_time) as p99
       FROM monitor_logs ml
       JOIN monitors m ON ml.monitor_id = m.id
       WHERE m.user_id = $1 AND ml.timestamp >= $2 AND ml.response_time IS NOT NULL
       GROUP BY date_trunc('${sqlInterval}', ml.timestamp)
       ORDER BY timestamp`,
      [req.user.id, startDate]
    );

    res.json(result.rows.map(row => ({
      timestamp: row.timestamp,
      avg: Math.round(row.avg || 0),
      p95: Math.round(row.p95 || 0),
      p99: Math.round(row.p99 || 0)
    })));
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
         DATE(a.triggered_at) as date,
         COUNT(*) as total
       FROM alerts a
       JOIN monitors m ON a.monitor_id = m.id
       WHERE m.user_id = $1 AND a.triggered_at >= $2
       GROUP BY DATE(a.triggered_at)
       ORDER BY date`,
      [req.user.id, startDate]
    );

    res.json(result.rows.map(row => ({
      date: row.date,
      critical: parseInt(row.total || 0), // All alerts are treated as incidents
      warning: 0, // No warning level in current schema
      resolved: 0 // No resolved tracking in current schema
    })));
  } catch (err) {
    console.error('Error fetching alerts history:', err);
    res.status(500).json({ msg: 'Server error fetching alerts history' });
  }
});

// 📊 Get per-monitor stats
router.get('/monitor-stats', auth, async (req, res) => {
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
         m.id,
         m.url,
         m.is_active,
         COUNT(CASE WHEN ml.status = 'UP' THEN 1 END)::float / NULLIF(COUNT(ml.id), 0)::float * 100 as uptime,
         AVG(ml.response_time) as avg_response_time,
         COUNT(DISTINCT a.id) as total_alerts,
         CASE 
           WHEN ml_latest.status = 'UP' THEN 'UP'
           WHEN ml_latest.status = 'DOWN' THEN 'DOWN'
           ELSE 'UNKNOWN'
         END as status
       FROM monitors m
       LEFT JOIN monitor_logs ml ON m.id = ml.monitor_id AND ml.timestamp >= $2
       LEFT JOIN alerts a ON m.id = a.monitor_id AND a.triggered_at >= $2
       LEFT JOIN LATERAL (
         SELECT status FROM monitor_logs 
         WHERE monitor_id = m.id 
         ORDER BY timestamp DESC 
         LIMIT 1
       ) ml_latest ON true
       WHERE m.user_id = $1
       GROUP BY m.id, m.url, m.is_active, ml_latest.status
       ORDER BY uptime DESC NULLS LAST`,
      [req.user.id, startDate]
    );

    res.json(result.rows.map(row => ({
      id: row.id,
      url: row.url,
      uptime: Math.round((row.uptime || 0) * 100) / 100,
      avgResponseTime: Math.round(row.avg_response_time || 0),
      totalAlerts: parseInt(row.total_alerts || 0),
      status: row.status || 'UNKNOWN'
    })));
  } catch (err) {
    console.error('Error fetching monitor stats:', err);
    res.status(500).json({ msg: 'Server error fetching monitor stats' });
  }
});

module.exports = router;

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

    // Count downtime events (status changes to DOWN)
    const downtimeEventsRes = await pool.query(
      `SELECT COUNT(*) as count FROM alerts a
       JOIN monitors m ON a.monitor_id = m.id
       WHERE m.user_id = $1 AND a.triggered_at >= $2`,
      [req.user.id, startDate]
    );
    const downtimeEvents = parseInt(downtimeEventsRes.rows[0].count);

    // Calculate trend changes (compare with previous period)
    const prevStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    
    const prevUptimeRes = await pool.query(
      `SELECT 
         COUNT(CASE WHEN ml.status = 'UP' THEN 1 END) as up_count,
         COUNT(*) as total_count
       FROM monitor_logs ml
       JOIN monitors m ON ml.monitor_id = m.id
       WHERE m.user_id = $1 AND ml.timestamp >= $2 AND ml.timestamp < $3`,
      [req.user.id, prevStartDate, startDate]
    );
    
    const prevUpCount = parseInt(prevUptimeRes.rows[0].up_count || 0);
    const prevTotalCount = parseInt(prevUptimeRes.rows[0].total_count || 0);
    const prevAvgUptime = prevTotalCount > 0 ? (prevUpCount / prevTotalCount) * 100 : 100;
    const uptimeChange = avgUptime - prevAvgUptime;

    const prevResponseTimeRes = await pool.query(
      `SELECT AVG(ml.response_time) as avg_response_time
       FROM monitor_logs ml
       JOIN monitors m ON ml.monitor_id = m.id
       WHERE m.user_id = $1 AND ml.timestamp >= $2 AND ml.timestamp < $3 AND ml.response_time IS NOT NULL`,
      [req.user.id, prevStartDate, startDate]
    );
    const prevAvgResponseTime = Math.round(prevResponseTimeRes.rows[0].avg_response_time || 0);
    const responseTimeChange = prevAvgResponseTime > 0 ? ((avgResponseTime - prevAvgResponseTime) / prevAvgResponseTime) * 100 : 0;

    const prevAlertsRes = await pool.query(
      `SELECT COUNT(*) as count FROM alerts a
       JOIN monitors m ON a.monitor_id = m.id
       WHERE m.user_id = $1 AND a.triggered_at >= $2 AND a.triggered_at < $3`,
      [req.user.id, prevStartDate, startDate]
    );
    const prevTotalAlerts = parseInt(prevAlertsRes.rows[0].count);
    const alertsChange = prevTotalAlerts > 0 ? ((totalAlerts - prevTotalAlerts) / prevTotalAlerts) * 100 : 0;

    res.json({
      totalMonitors,
      activeMonitors,
      avgUptime: Math.round(avgUptime * 100) / 100,
      totalAlerts,
      avgResponseTime,
      downtimeEvents,
      uptimeChange: Math.round(uptimeChange * 100) / 100,
      responseTimeChange: Math.round(responseTimeChange * 100) / 100,
      alertsChange: Math.round(alertsChange * 100) / 100
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
    let interval, startDate;
    const now = new Date();
    
    switch (range) {
      case '24h':
        interval = 'hour';
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        interval = 'day';
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        interval = 'day';
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        interval = 'day';
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        interval = 'day';
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const result = await pool.query(
      `SELECT 
         date_trunc($1, ml.timestamp) as timestamp,
         COUNT(CASE WHEN ml.status = 'UP' THEN 1 END)::float / COUNT(*)::float * 100 as uptime,
         COUNT(CASE WHEN ml.status = 'DOWN' THEN 1 END)::float / COUNT(*)::float * 100 as downtime
       FROM monitor_logs ml
       JOIN monitors m ON ml.monitor_id = m.id
       WHERE m.user_id = $2 AND ml.timestamp >= $3
       GROUP BY date_trunc($1, ml.timestamp)
       ORDER BY timestamp`,
      [interval, req.user.id, startDate]
    );

    res.json(result.rows.map(row => ({
      timestamp: row.timestamp,
      uptime: Math.round((row.uptime || 0) * 100) / 100,
      downtime: Math.round((row.downtime || 0) * 100) / 100
    })));
  } catch (err) {
    console.error('Error fetching uptime history:', err);
    res.status(500).json({ msg: 'Server error fetching uptime history' });
  }
});

// ⚡ Get response time history
router.get('/response-time', auth, async (req, res) => {
  const { range = '7d' } = req.query;
  
  try {
    let interval, startDate;
    const now = new Date();
    
    switch (range) {
      case '24h':
        interval = 'hour';
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        interval = 'hour';
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        interval = 'day';
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        interval = 'day';
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        interval = 'hour';
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const result = await pool.query(
      `SELECT 
         date_trunc($1, ml.timestamp) as timestamp,
         AVG(ml.response_time) as avg,
         PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ml.response_time) as p95,
         PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY ml.response_time) as p99
       FROM monitor_logs ml
       JOIN monitors m ON ml.monitor_id = m.id
       WHERE m.user_id = $2 AND ml.timestamp >= $3 AND ml.response_time IS NOT NULL
       GROUP BY date_trunc($1, ml.timestamp)
       ORDER BY timestamp`,
      [interval, req.user.id, startDate]
    );

    res.json(result.rows.map(row => ({
      timestamp: row.timestamp,
      avg: Math.round(row.avg || 0),
      p95: Math.round(row.p95 || 0),
      p99: Math.round(row.p99 || 0)
    })));
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
         DATE(a.triggered_at) as date,
         COUNT(*) as total
       FROM alerts a
       JOIN monitors m ON a.monitor_id = m.id
       WHERE m.user_id = $1 AND a.triggered_at >= $2
       GROUP BY DATE(a.triggered_at)
       ORDER BY date`,
      [req.user.id, startDate]
    );

    res.json(result.rows.map(row => ({
      date: row.date,
      critical: parseInt(row.total || 0), // All alerts are treated as critical since we don't have severity
      warning: 0,
      resolved: 0 // We don't track resolved separately
    })));
  } catch (err) {
    console.error('Error fetching alerts history:', err);
    res.status(500).json({ msg: 'Server error fetching alerts history' });
  }
});

// 📊 Get per-monitor stats
router.get('/monitor-stats', auth, async (req, res) => {
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
         m.id,
         m.url,
         m.is_active,
         COUNT(CASE WHEN ml.status = 'UP' THEN 1 END)::float / NULLIF(COUNT(ml.id), 0)::float * 100 as uptime,
         AVG(ml.response_time) as avg_response_time,
         COUNT(DISTINCT a.id) as total_alerts,
         CASE 
           WHEN ml_latest.status = 'UP' THEN 'UP'
           ELSE 'DOWN'
         END as status
       FROM monitors m
       LEFT JOIN monitor_logs ml ON m.id = ml.monitor_id AND ml.timestamp >= $2
       LEFT JOIN alerts a ON m.id = a.monitor_id AND a.triggered_at >= $2
       LEFT JOIN LATERAL (
         SELECT status FROM monitor_logs 
         WHERE monitor_id = m.id 
         ORDER BY timestamp DESC 
         LIMIT 1
       ) ml_latest ON true
       WHERE m.user_id = $1
       GROUP BY m.id, m.url, m.is_active, ml_latest.status
       ORDER BY uptime DESC NULLS LAST`,
      [req.user.id, startDate]
    );

    res.json(result.rows.map(row => ({
      id: row.id,
      url: row.url,
      uptime: Math.round((row.uptime || 0) * 100) / 100,
      avgResponseTime: Math.round(row.avg_response_time || 0),
      totalAlerts: parseInt(row.total_alerts || 0),
      status: row.status || 'UNKNOWN'
    })));
  } catch (err) {
    console.error('Error fetching monitor stats:', err);
    res.status(500).json({ msg: 'Server error fetching monitor stats' });
  }
});

module.exports = router;
