import { Resend } from 'resend';

export function getContactToEmail(defaultToEmail: string) {
  return process.env.CONTACT_TO_EMAIL || defaultToEmail;
}

export function getMailFromAddress() {
  return process.env.MAIL_FROM || 'Otosipsak <info@otosipsak.com>';
}

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY eksik.');
  }

  return new Resend(apiKey);
}

export async function sendMailWithResend(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string | null;
}) {
  const resend = getResendClient();

  return resend.emails.send({
    from: getMailFromAddress(),
    to: [input.to],
    subject: input.subject,
    text: input.text,
    html: input.html,
    replyTo: input.replyTo || undefined
  });
}
