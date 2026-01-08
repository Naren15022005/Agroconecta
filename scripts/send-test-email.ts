import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const to = process.argv[2] || process.env.TEST_EMAIL || user;

if (!host || !user || !pass) {
  console.error('SMTP_HOST, SMTP_USER or SMTP_PASS missing. Fill them in .env before running this script.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

async function send() {
  try {
    await transporter.verify();
    const info = await transporter.sendMail({
      from: `AgroConecta <${user}>`,
      to,
      subject: 'Prueba de envio — AgroConecta',
      text: 'Este es un correo de prueba desde AgroConecta. Si lo recibes, la configuración SMTP funciona.',
      html: `<p>Este es un correo de prueba desde <strong>AgroConecta</strong>. Si lo recibes, la configuración SMTP funciona.</p>`,
    });
    console.log('Correo enviado. MessageId:', info.messageId || info);
  } catch (e) {
    console.error('Error enviando correo de prueba:', e);
    process.exit(2);
  }
}

send();
