#!/usr/bin/env node

console.log('🚀 RAILWAY TEST STARTING...');
console.log('Time:', new Date().toISOString());
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Working directory:', process.cwd());
console.log('Environment variables count:', Object.keys(process.env).length);
console.log('PORT:', process.env.PORT || 'NOT SET');

let counter = 0;
const timer = setInterval(() => {
  counter++;
  console.log(`💓 HEARTBEAT ${counter}:`, new Date().toISOString());
  
  if (counter >= 20) {
    console.log('✅ Test completed successfully - app would be stable');
    clearInterval(timer);
  }
}, 3000);

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  clearInterval(timer);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  clearInterval(timer);
  process.exit(0);
});

console.log('✅ TEST SCRIPT INITIALIZED - Will run for 60 seconds');
