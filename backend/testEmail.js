// testAlertEmail.js
const sendEmail = require('./utils/sendEmail');

sendEmail(
  'mshr22380@gmail.com',
  '📎 Test Email with PDF',
  'This is a test email with a PDF attachment.',
  './temp/test.pdf' // Make sure this file exists or generate one using your generateAlertPDF
).then(() => {
  console.log('✅ Email with attachment sent!');
}).catch(console.error);
