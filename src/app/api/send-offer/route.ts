import { NextResponse } from 'next/server';
import { getContactToEmail, sendMailWithResend } from '@/lib/mail';

const toEmail = 'sssametcanteke@gmail.com';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    await sendMailWithResend({
      to: getContactToEmail(toEmail),
      subject: 'Araç Satış Teklifi',
      text: JSON.stringify(payload, null, 2)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('send-offer resend error', error);
    return NextResponse.json({ success: false, error: 'Email gönderilemedi' }, { status: 500 });
  }
}

