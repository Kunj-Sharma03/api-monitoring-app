// Simple test to check Google OAuth configuration
fetch('https://api-monitoring-app-production.up.railway.app/api/auth/google')
  .then(response => {
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    if (response.status === 503) {
      console.log('❌ Google OAuth not configured - missing environment variables');
    } else if (response.status === 302) {
      console.log('✅ Google OAuth configured - should redirect to Google');
    } else {
      console.log('❓ Unexpected response');
    }
    return response.text();
  })
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
