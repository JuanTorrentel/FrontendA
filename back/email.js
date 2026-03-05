/**
 * Módulo de email
 *
 * Soporta 2 providers:
 *  - console (por defecto): solo logea el correo.
 *  - smtp (recomendado): usa SMTP (por ejemplo SES) mediante credenciales.
 *
 * Config (env):
 *  EMAIL_PROVIDER=smtp
 *  SMTP_HOST=...
 *  SMTP_PORT=587
 *  SMTP_USER=...
 *  SMTP_PASS=...
 *  EMAIL_FROM=noreply@yotagoschool.pro
 */

const nodemailer = require('nodemailer');
const { logInfo, logError } = require('./logger');

const PROVIDER = process.env.EMAIL_PROVIDER || 'console';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@example.com';

let smtpTransport = null;

function getSmtpTransport() {
  if (smtpTransport) return smtpTransport;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logError('email_smtp_missing_config', new Error('Faltan variables SMTP'), {});
    return null;
  }
  smtpTransport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  return smtpTransport;
}

async function sendMail({ to, subject, html, text, meta = {} }) {
  if (!to) {
    logInfo('email_skip_missing_to', meta);
    return;
  }

  if (PROVIDER === 'smtp') {
    const transport = getSmtpTransport();
    if (!transport) {
      logInfo('email_fallback_console', { to, subject, ...meta });
    } else {
      try {
        const info = await transport.sendMail({
          from: EMAIL_FROM,
          to,
          subject,
          text,
          html,
        });
        logInfo('email_send_smtp', {
          to,
          subject,
          messageId: info.messageId,
          provider: 'smtp',
          ...meta,
        });
        return;
      } catch (err) {
        logError('email_smtp_error', err, { to, subject, ...meta });
        // Si falla SMTP, no volvemos a intentar con otro provider aquí.
        return;
      }
    }
  }

  // Provider por defecto: consola
  logInfo('email_send_console', {
    to,
    subject,
    text,
    htmlSnippet: html ? String(html).slice(0, 200) : null,
    provider: PROVIDER,
    ...meta,
  });
}

async function sendVerificationEmail({ to, verifyUrl }) {
  const subject = 'Verifica tu cuenta en Yotago School';
  const text = `Hola,

Para activar tu cuenta en Yotago School haz clic en el siguiente enlace:
${verifyUrl}

Si no creaste esta cuenta, puedes ignorar este correo.`;

  const html = `<p>Hola,</p>
<p>Para activar tu cuenta en <strong>Yotago School</strong>, haz clic en el siguiente botón:</p>
<p><a href="${verifyUrl}" target="_blank" rel="noopener noreferrer">Verificar cuenta</a></p>
<p>Si no creaste esta cuenta, puedes ignorar este correo.</p>`;

  await sendMail({ to, subject, text, html, meta: { kind: 'verify', to } });
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const subject = 'Restablecer contraseña - Yotago School';
  const text = `Hola,

Has solicitado restablecer tu contraseña en Yotago School.
Para continuar, abre este enlace en tu navegador:
${resetUrl}

Si tú no solicitaste este cambio, puedes ignorar este correo.`;

  const html = `<p>Hola,</p>
<p>Has solicitado restablecer tu contraseña en <strong>Yotago School</strong>.</p>
<p>Para continuar, haz clic en el siguiente botón:</p>
<p><a href="${resetUrl}" target="_blank" rel="noopener noreferrer">Restablecer contraseña</a></p>
<p>Si tú no solicitaste este cambio, puedes ignorar este correo.</p>`;

  await sendMail({ to, subject, text, html, meta: { kind: 'password_reset', to } });
}

module.exports = {
  sendMail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};

