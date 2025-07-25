import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(email: string, name: string, token?: string) {
  // Si hay token, se envía enlace de activación, si no, solo bienvenida
  const activationLink = token
    ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/activar/${token}`
    : null;

  const html = `
    <h2>¡Bienvenido a AgroConecta, ${name}!</h2>
    <p>Gracias por registrarte en nuestra plataforma.</p>
    ${activationLink ? `<p>Por favor, activa tu cuenta haciendo clic en el siguiente enlace:</p>
    <a href="${activationLink}">${activationLink}</a>` : '<p>¡Ya puedes comenzar a usar AgroConecta!</p>'}
    <br/>
    <p>Si no creaste esta cuenta, ignora este correo.</p>
  `;

  await transporter.sendMail({
    from: 'AgroConecta <no-reply@agroconecta.com>',
    to: email,
    subject: 'Bienvenido a AgroConecta',
    html,
  });
}
