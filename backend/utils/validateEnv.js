function validateEnv() {
  const required = [
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  // Optional variables with defaults for Railway deployment
  const optional = {
    'EMAIL_FROM': 'noreply@apimonitoring.app',
    'BREVO_SMTP_USER': '',
    'BREVO_SMTP_PASS': '',
    'LOG_CLEANUP_DAYS': '7',
  };

  console.log('🔍 Environment Validation:');
  
  // Check required variables
  const missing = [];
  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
      console.error(`❌ Missing required environment variable: ${key}`);
    } else {
      console.log(`✅ ${key}: EXISTS`);
    }
  });

  // Set defaults for optional variables
  Object.entries(optional).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      console.log(`⚠️  ${key}: Using default value`);
    } else {
      console.log(`✅ ${key}: EXISTS`);
    }
  });

  // Report if critical variables are missing (do not kill process here)
  if (missing.length > 0) {
    const msg = `Missing critical environment variables: ${missing.join(', ')}`;
    console.error(`❌ ${msg}`);
    // Throw so callers can decide whether to continue
    throw new Error(msg);
  }

  const port = parseInt(process.env.PORT, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    const msg = 'PORT must be a number between 1 and 65535';
    console.error(`❌ ${msg}`);
    throw new Error(msg);
  }

  if (process.env.JWT_SECRET.length < 16) {
    const msg = 'JWT_SECRET is too short (recommend >= 32 chars)';
    console.error(`❌ ${msg}`);
    throw new Error(msg);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.EMAIL_FROM)) {
    const msg = 'EMAIL_FROM is not a valid email address';
    console.error(`❌ ${msg}`);
    throw new Error(msg);
  }

  const cleanupDays = parseInt(process.env.LOG_CLEANUP_DAYS, 10);
  if (isNaN(cleanupDays) || cleanupDays < 1) {
    const msg = 'LOG_CLEANUP_DAYS must be a positive integer';
    console.error(`❌ ${msg}`);
    throw new Error(msg);
  }

  console.log('✅ All environment variables validated successfully');
}

module.exports = validateEnv;
