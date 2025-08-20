console.log('=== ULTRA SIMPLE TEST ===');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('PORT:', process.env.PORT);
console.log('Current directory:', process.cwd());

// Keep the process alive
setInterval(() => {
  console.log('💓 Still alive:', new Date().toISOString());
}, 5000);

console.log('✅ Test script started, will keep alive...');
