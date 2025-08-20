#!/usr/bin/env node

console.log('=== RAILWAY DEBUG START ===');
console.log('Current working directory:', process.cwd());
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform, process.arch);
console.log('Arguments:', process.argv);
console.log('Environment:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- PWD:', process.env.PWD);

const fs = require('fs');
const path = require('path');

try {
  const files = fs.readdirSync('.');
  console.log('Files in current directory:', files);
} catch (err) {
  console.error('Cannot read directory:', err.message);
}

try {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log('Package.json main:', packageJson.main);
  console.log('Package.json scripts:', packageJson.scripts);
} catch (err) {
  console.error('Cannot read package.json:', err.message);
}

console.log('=== Starting simple HTTP server ===');

const http = require('http');
const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  console.log('Request received:', req.method, req.url);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Simple Railway debug server',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Simple server listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Keep alive
setInterval(() => {
  console.log('💓 Heartbeat:', new Date().toISOString());
}, 15000);

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

console.log('=== RAILWAY DEBUG END ===');
