
import nodemailer from 'nodemailer';

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function sanitizeEnvString(v?: string) {
  if (!v) return undefined;
  return v.replace(/\s+/g, '');
}

function isEmailConfigured() {
  return true;
}

function getFromAddress() {
  const smtpUser = sanitizeEnvString(process.env.SMTP_USER) || 'agroconecta50@gmail.com';
  const from = process.env.SMTP_FROM;
  if (from) return from;
  if (smtpUser) return `AgroConecta <${smtpUser}>`;
  return 'AgroConecta <agroconecta50@gmail.com>';
}

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure = smtpPort === 465;
const smtpUserSan = sanitizeEnvString(process.env.SMTP_USER) || 'agroconecta50@gmail.com';
const smtpPassSan = sanitizeEnvString(process.env.SMTP_PASS) || 'trzdtgegjepgbubt';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: { user: smtpUserSan, pass: smtpPassSan }
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

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    let url = process.env.NEXT_PUBLIC_BASE_URL.trim();
    if (!url.startsWith('http')) url = `https://${url}`;
    return url.replace(/\/$/, '');
  }
  if (process.env.NEXTAUTH_URL) {
    let url = process.env.NEXTAUTH_URL.trim();
    if (!url.startsWith('http')) url = `https://${url}`;
    return url.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.trim()}`;
  }
  return 'http://localhost:3000';
}

export async function sendWelcomeEmail(email: string, name: string, token?: string) {
  // Si hay token, se envía enlace de activación, si no, solo bienvenida
  const activationLink = token
    ? `${getBaseUrl()}/auth/activar/${token}`
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
  return getBaseUrl();
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
