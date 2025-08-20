const express = require('express');
const app = express();

// Basic health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      hasDatabase: !!process.env.DATABASE_URL,
      hasJWT: !!process.env.JWT_SECRET
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'API Monitoring App - Debug Mode' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Debug server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL ? 'EXISTS' : 'MISSING',
    JWT_SECRET: process.env.JWT_SECRET ? 'EXISTS' : 'MISSING'
  });
});

// Error handlers
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled Rejection:', err.message);
});

// Keep alive
setInterval(() => {
  console.log('💓 App is alive at', new Date().toISOString());
}, 30000);
