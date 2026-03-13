import { NextResponse } from 'next/server';
import { formatCallMeMail } from '@/lib/mail-format';
import { getContactToEmail, sendMailWithResend } from '@/lib/mail';

const defaultToEmail = 'sssametcanteke@gmail.com';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const toEmail = getContactToEmail(defaultToEmail);
    const replyTo =
      payload?.contact?.email && /^\S+@\S+\.\S+$/.test(payload.contact.email) ? payload.contact.email : null;
    const { text, html } = formatCallMeMail(payload);

    await sendMailWithResend({
      to: toEmail,
      subject: 'Sizi Arayalım Talebi',
      text,
      html,
      replyTo
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('send-callme resend error', error);
    return NextResponse.json({ success: false, error: 'Email gönderilemedi' }, { status: 500 });
  }
}


