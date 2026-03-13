import { NextResponse } from 'next/server';
import { formatOfferMail } from '@/lib/mail-format';
import { getContactToEmail, sendMailWithResend } from '@/lib/mail';

const toEmail = 'sssametcanteke@gmail.com';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { text, html } = formatOfferMail(payload);
    await sendMailWithResend({
      to: getContactToEmail(toEmail),
      subject: 'Araç Satış Teklifi',
      text,
      html
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('send-offer resend error', error);
    return NextResponse.json({ success: false, error: 'Email gönderilemedi' }, { status: 500 });
  }
}

