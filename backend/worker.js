require('dotenv').config();
const cron = require('node-cron');
const checkMonitors = require('./services/monitorWorker');

// Run every minute (adjust as needed)
cron.schedule('*/5 * * * * *', () => {
  console.log(`[${new Date().toISOString()}] Running monitor check...`);
  checkMonitors();
});