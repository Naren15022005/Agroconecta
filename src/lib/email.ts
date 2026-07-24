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
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getFromAddress() {
  const smtpUser = sanitizeEnvString(process.env.SMTP_USER);
  const from = process.env.SMTP_FROM;
  if (from) return from;
  if (smtpUser) return `AgroConecta <${smtpUser}>`;
  return 'AgroConecta <no-reply@agroconecta.com>';
}

const smtpUserSan = sanitizeEnvString(process.env.SMTP_USER);
const smtpPassSan = sanitizeEnvString(process.env.SMTP_PASS);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: smtpUserSan && smtpPassSan ? { user: smtpUserSan, pass: smtpPassSan } : undefined,
  tls: { rejectUnauthorized: false }
});

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  if (!isEmailConfigured()) {
    console.warn('[email] SMTP no configurado; omitiendo envío a', to);
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
    console.log('[email] Correo enviado exitosamente:', { to, subject, messageId: info.messageId });
    return { ok: true as const, messageId: info.messageId };
  } catch (err) {
    console.error('[email] Error enviando correo:', err);
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

export async function sendWelcomeEmail(email: string, name: string) {
  const loginUrl = `${getBaseUrl()}/auth/signin?activated=true`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>¡Cuenta Activada en AgroConecta!</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #e5e5e5;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #1e1e1e; border: 1px solid #333333; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <!-- Banner Verde AgroConecta -->
              <tr>
                <td align="center" style="background: linear-gradient(135deg, #4d7c0f 0%, #65a30d 100%); padding: 30px 20px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; tracking: -0.5px;">🌾 AgroConecta</h1>
                  <p style="color: #ecfccb; margin: 6px 0 0 0; font-size: 14px; font-weight: 500;">Conectando el campo directamente con la ciudad</p>
                </td>
              </tr>

              <!-- Contenido -->
              <tr>
                <td style="padding: 35px 30px;">
                  <h2 style="color: #ffffff; margin-top: 0; font-size: 22px; font-weight: 700;">¡Hola ${name}!</h2>
                  <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                    ¡Buenas noticias! Tu cuenta ha sido creada y <strong style="color: #84cc16;">activada exitosamente</strong>. Ya formas parte de la red agrícola directa de Colombia.
                  </p>

                  <div style="background-color: #262626; border-left: 4px solid #84cc16; padding: 16px; border-radius: 8px; margin-bottom: 25px;">
                    <p style="color: #d4d4d4; font-size: 14px; margin: 0;">
                      ✨ <strong>Tu cuenta está lista para usarse:</strong> Puedes explorar el mercado agrícola, realizar compras directas a campesinos o publicar tus cosechas.
                    </p>
                  </div>

                  <!-- Botón Ingresar -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="padding: 10px 0 25px 0;">
                        <a href="${loginUrl}" target="_blank" style="background: linear-gradient(90deg, #65a30d 0%, #84cc16 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(101, 163, 13, 0.4);">
                          Ingresar a Mi Cuenta →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #737373; font-size: 13px; text-align: center; margin: 0;">
                    Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br/>
                    <a href="${loginUrl}" style="color: #84cc16; text-decoration: underline; word-break: break-all;">${loginUrl}</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #171717; padding: 20px 30px; border-top: 1px solid #262626; text-align: center;">
                  <p style="color: #525252; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} AgroConecta Colombia. Todos los derechos reservados.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: '🌾 ¡Cuenta Activada con Éxito en AgroConecta!',
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
