console.log('🚀 Starting debug server...');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);

try {
  const express = require('express');
  console.log('✅ Express loaded successfully');
  
  const app = express();
  console.log('✅ Express app created');

  // Basic health check
  app.get('/health', (req, res) => {
    console.log('📡 Health check requested');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      message: 'Debug server is running'
    });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    console.log('🏠 Root endpoint requested');
    res.json({ message: 'API Monitoring App - Debug Mode' });
  });

  const PORT = process.env.PORT || 5000;
  console.log('🔌 Attempting to start server on port:', PORT);

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Debug server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err.message);
  });

  // Keep alive
  setInterval(() => {
    console.log('💓 App is alive at', new Date().toISOString());
  }, 10000);

  console.log('✅ Debug server setup complete');

} catch (error) {
  console.error('❌ Failed to start debug server:', error.message);
  console.error(error.stack);
  process.exit(1);
}

// Error handlers
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled Rejection:', err.message);
});
