
import nodemailer from 'nodemailer';

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getFromAddress() {
  const smtpUser = process.env.SMTP_USER;
  const from = process.env.SMTP_FROM;
  if (from) return from;
  if (smtpUser) return `AgroConecta <${smtpUser}>`;
  return 'AgroConecta <no-reply@agroconecta.com>';
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  if (!isEmailConfigured()) {
    console.warn('[email] SMTP not configured; skipping email to', to, 'subject:', subject);
    return { ok: false as const, skipped: true as const };
  }

  try {
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to,
      subject,
      html,
      text,
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log('[email] sent:', { to, subject, messageId: info.messageId });
    }
    return { ok: true as const, messageId: info.messageId };
  } catch (err) {
    console.error('[email] Failed to send email:', err);
    return { ok: false as const, skipped: false as const };
  }
}

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

  await sendEmail({
    to: email,
    subject: 'Bienvenido a AgroConecta',
    html,
  });
}

function baseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

export function buildPedidoStatusEmail(params: {
  buyerName?: string | null;
  pedidoId: string;
  status: 'CONFIRMADO' | 'EN_PREPARACION' | 'EN_PUNTO' | 'EN_CAMINO' | 'ENTREGADO';
  message: string;
}) {
  const name = params.buyerName ? ` ${params.buyerName}` : '';
  const pedidoUrl = `${baseUrl()}/comprador/pedidos`;
  const statusLabel: Record<string, string> = {
    CONFIRMADO: 'Confirmado',
    EN_PREPARACION: 'En preparación',
    EN_PUNTO: 'Listo para envío/recogida',
    EN_CAMINO: 'En camino',
    ENTREGADO: 'Entregado',
  };

  const subject =
    params.status === 'ENTREGADO'
      ? 'Tu pedido ha sido entregado'
      : `Actualización de tu pedido: ${statusLabel[params.status] ?? params.status}`;

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height: 1.5;">
      <h2>Hola${name},</h2>
      <p><strong>Tu pedido</strong> (${params.pedidoId}) cambió de estado: <strong>${statusLabel[params.status] ?? params.status}</strong>.</p>
      <p>${params.message}</p>
      <p>Puedes revisar tus pedidos aquí:</p>
      <p><a href="${pedidoUrl}">${pedidoUrl}</a></p>
      <hr />
      <p style="color: #666; font-size: 12px;">Si no reconoces este pedido, ignora este correo.</p>
    </div>
  `;

  const text = `Hola${name},\n\nTu pedido (${params.pedidoId}) cambió de estado a: ${statusLabel[params.status] ?? params.status}.\n${params.message}\n\nVer pedidos: ${pedidoUrl}`;

  return { subject, html, text };
}

export function buildLiquidacionEmail(params: {
  agricultorName?: string | null;
  monto: number;
  metodoPago?: string | null;
  referencia?: string | null;
  comprobanteUrl?: string | null;
}) {
  const name = params.agricultorName ? ` ${params.agricultorName}` : '';
  const metodo = params.metodoPago ?? 'LIQUIDACION';
  const referencia = params.referencia ?? 'N/A';
  const subject = 'Tu pago ha sido liquidado';
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height: 1.5;">
      <h2>Hola${name},</h2>
      <p>El administrador ha procesado una <strong>liquidación</strong> a tu favor.</p>
      <ul>
        <li><strong>Monto:</strong> ${params.monto}</li>
        <li><strong>Método:</strong> ${metodo}</li>
        <li><strong>Referencia:</strong> ${referencia}</li>
      </ul>
      ${params.comprobanteUrl ? `<p><strong>Comprobante:</strong> <a href="${params.comprobanteUrl}">${params.comprobanteUrl}</a></p>` : ''}
      <p>Ya puedes ver el movimiento reflejado en tu billetera.</p>
      <hr />
      <p style="color: #666; font-size: 12px;">Si crees que esto es un error, contáctanos.</p>
    </div>
  `;
  const text = `Hola${name},\n\nSe procesó una liquidación a tu favor.\nMonto: ${params.monto}\nMétodo: ${metodo}\nReferencia: ${referencia}${params.comprobanteUrl ? `\nComprobante: ${params.comprobanteUrl}` : ''}`;
  return { subject, html, text };
}
