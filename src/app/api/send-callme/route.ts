import { NextResponse } from 'next/server';
import { buildMailTransport, getContactToEmail } from '@/lib/mail';

const defaultToEmail = 'sssametcanteke@gmail.com';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const transport = buildMailTransport();

    const toEmail = getContactToEmail(defaultToEmail);

    const mail = {
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to: toEmail,
      subject: 'Sizi Arayalım Talebi',
      text: JSON.stringify(payload, null, 2)
    };

    await transport.sendMail(mail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('send-callme mail error', error);
    return NextResponse.json({ success: false, error: 'Email gönderilemedi' }, { status: 500 });
  }
}


