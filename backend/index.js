require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const monitorRoutes = require('./routes/monitor');
const cron = require('node-cron');
const checkMonitors = require('./services/monitorWorker');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is working!');
});

cron.schedule('* * * * *', async () => {
  console.log('Running scheduled monitor check...');
  await checkMonitors();
});

const PORT = process.env.PORT || 5000;
app.use('/api', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/monitor', monitorRoutes);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
