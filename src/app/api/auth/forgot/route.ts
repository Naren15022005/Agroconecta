import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ message: 'Email required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { correo: email } });
    if (!user) {
      // Don't reveal existence
      return NextResponse.json({ ok: true });
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.verificationToken.create({
      data: {
        id: token,
        identifier: email,
        token: token,
        expires: expires
      }
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset/${token}`;
    // Send email if SMTP is configured, otherwise log link in non-prod.
    const smtpHost = process.env.SMTP_HOST;
    if (smtpHost) {
      const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
      const secure = port === 465;
      const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.replace(/\s+/g, '') : undefined;
      const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : undefined;
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure,
        auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
      });

      try {
        // verify connection configuration before sending
        await transporter.verify();
      } catch (err) {
        console.error('SMTP verification failed:', err);
        // In development still log token, but return error so frontend can surface it
        if (process.env.NODE_ENV !== 'production') console.log(`Password reset link for ${email}: ${resetUrl}`);
        return NextResponse.json({ ok: false, message: 'Error verificando servidor de correo' }, { status: 500 });
      }

      try {
        const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || `no-reply@${process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, '') || 'localhost'}`;
        const subject = 'Restablece tu contraseña';
        const html = `
          <p>Hola,</p>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña. El enlace expira en 1 hora.</p>
          <p><a href="${resetUrl}">Restablecer contraseña</a></p>
          <p>Si no solicitaste este correo, ignora este mensaje.</p>
        `;
        const text = `Restablecer contraseña: ${resetUrl}`;

        const info = await transporter.sendMail({ from, to: email, subject, text, html });
        if (process.env.NODE_ENV !== 'production') console.log('[email] sent reset mail:', { to: email, messageId: info.messageId });
      } catch (err) {
        console.error('Error sending reset email:', err);
        if (process.env.NODE_ENV !== 'production') console.log(`Password reset link for ${email}: ${resetUrl}`);
        return NextResponse.json({ ok: false, message: 'Error enviando correo' }, { status: 500 });
      }
    } else {
      if (process.env.NODE_ENV !== 'production') console.log(`Password reset link for ${email}: ${resetUrl}`);
    }

    // Never return the reset URL to the client. The frontend should inform the
    // user that an email was sent if the account exists.
    return NextResponse.json({ ok: true, message: 'Si el correo existe, se ha enviado un enlace para restablecer la contraseña.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
