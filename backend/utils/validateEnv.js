function validateEnv() {
  const required = [
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'EMAIL_FROM',
    'BREVO_SMTP_USER',
    'BREVO_SMTP_PASS',
    'LOG_CLEANUP_DAYS',
  ];

  required.forEach((key) => {
    if (!process.env[key]) {
      console.error(`❌ Missing required environment variable: ${key}`);
      process.exit(1);
    }
  });

  const port = parseInt(process.env.PORT, 10);
  if (isNaN(port) || port < 1024 || port > 65535) {
    console.error('❌ PORT must be a number between 1024 and 65535');
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.EMAIL_FROM)) {
    console.error('❌ EMAIL_FROM is not a valid email address');
    process.exit(1);
  }

  const cleanupDays = parseInt(process.env.LOG_CLEANUP_DAYS, 10);
  if (isNaN(cleanupDays) || cleanupDays < 1) {
    console.error('❌ LOG_CLEANUP_DAYS must be a positive integer');
    process.exit(1);
  }

  console.log('✅ All environment variables validated successfully');
}

module.exports = validateEnv;
