require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

sendEmail('og.ryouu@gmail.com', '📧 Test from Brevo', 'This is a test email via Brevo SMTP')
  .then(() => console.log('✅ Test email sent via Brevo'))
  .catch(console.error);
