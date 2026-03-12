import nodemailer from 'nodemailer';

function parseBooleanEnv(value: string | undefined) {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return undefined;
}

export function buildMailTransport() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT || 587);
    const envSecure = parseBooleanEnv(process.env.SMTP_SECURE);
    const secure = envSecure ?? port === 465;

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      requireTLS: !secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  return nodemailer.createTransport({
    jsonTransport: true
  });
}

export function getContactToEmail(defaultToEmail: string) {
  return process.env.CONTACT_TO_EMAIL || defaultToEmail;
}
