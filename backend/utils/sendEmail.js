require('dotenv').config();
const nodemailer = require('nodemailer');



const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

async function sendEmail(to, subject, text, attachmentPath = null) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
  };

  if (attachmentPath) {
    mailOptions.attachments = [
      {
        filename: attachmentPath.split('/').pop(),
        path: attachmentPath,
      },
    ];
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent');
  } catch (err) {
    console.error('❌ Email error:', err);
  }
}

module.exports = sendEmail;
