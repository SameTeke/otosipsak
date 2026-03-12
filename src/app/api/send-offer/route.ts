import { NextResponse } from 'next/server';
import { buildMailTransport, getContactToEmail } from '@/lib/mail';

const toEmail = 'sssametcanteke@gmail.com';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const transport = buildMailTransport();

    const mail = {
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to: getContactToEmail(toEmail),
      subject: 'Araç Satış Teklifi',
      text: JSON.stringify(payload, null, 2)
    };

    await transport.sendMail(mail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('send-offer mail error', error);
    return NextResponse.json({ success: false, error: 'Email gönderilemedi' }, { status: 500 });
  }
}

