import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER?.replace(/\s+/g, '') || undefined;
const pass = process.env.SMTP_PASS?.replace(/\s+/g, '') || undefined;

console.log('SMTP configuration from env:');
console.log({ host, port, user: user ? '*** set ***' : undefined, pass: pass ? '*** set ***' : undefined });

if (!host || !user || !pass) {
  console.warn('SMTP_HOST, SMTP_USER or SMTP_PASS not configured in .env. Emails will not be sent.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // true for 465, false for other ports
  auth: { user, pass },
});

transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP verification failed:', err);
    process.exit(2);
  }
  console.log('SMTP verified successfully. Ready to send emails.');
  process.exit(0);
});
