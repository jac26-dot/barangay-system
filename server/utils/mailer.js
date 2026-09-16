// server/utils/mailer.js
//
// Sends OTP verification emails via Gmail SMTP using Nodemailer.
// Credentials come from environment variables only — never hardcode
// them here. Set these on Render (Environment tab):
//   OTP_EMAIL_USER      e.g. barangay697.otp@gmail.com
//   OTP_EMAIL_PASSWORD  the 16-character Google App Password (no spaces)

const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.OTP_EMAIL_USER || !process.env.OTP_EMAIL_PASSWORD) {
    console.error('OTP email is not configured: set OTP_EMAIL_USER and OTP_EMAIL_PASSWORD.');
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.OTP_EMAIL_USER,
      pass: process.env.OTP_EMAIL_PASSWORD.replace(/\s+/g, ''), // app passwords are sometimes copied with spaces
    },
  });
  return transporter;
}

async function sendOtpEmail(toEmail, otp) {
  const t = getTransporter();
  if (!t) throw new Error('Email service is not configured.');

  await t.sendMail({
    from: `"Barangay 697 Zone 76" <${process.env.OTP_EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Barangay 697 Zone 76 verification code',
    text: `Your verification code is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px;border:1px solid #dfe3e8;">
        <h2 style="color:#14315c;margin:0 0 8px;">Barangay 697 Zone 76</h2>
        <p style="color:#374151;font-size:14px;">Use the code below to verify your email address for your Resident Portal account.</p>
        <div style="background:#eef1f5;border:1px dashed #9fb0c9;text-align:center;padding:16px;margin:20px 0;">
          <div style="font-size:28px;font-weight:800;letter-spacing:6px;color:#14315c;">${otp}</div>
        </div>
        <p style="color:#6b7280;font-size:12.5px;">This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail };
