import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashOtp, normalizeTRPhone, randomOtpCode, randomSalt, sendSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

const OTP_TTL_MS = 5 * 60 * 1000;
const MIN_RESEND_MS = 60 * 1000;
const MAX_SENDS_PER_15_MIN = 5;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phoneRaw: string = body?.phone || '';
    const phone = normalizeTRPhone(phoneRaw);
    if (!phone) {
      return NextResponse.json({ success: false, error: 'Telefon gerekli' }, { status: 400 });
    }

    const now = Date.now();
    const fifteenMinAgo = new Date(now - 15 * 60 * 1000);
    const sendsInWindow = await prisma.smsOtp.count({
      where: { phone, createdAt: { gte: fifteenMinAgo } }
    });
    if (sendsInWindow >= MAX_SENDS_PER_15_MIN) {
      return NextResponse.json(
        { success: false, error: 'Çok fazla deneme. Lütfen 15 dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    const last = await prisma.smsOtp.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });
    if (last?.createdAt && now - last.createdAt.getTime() < MIN_RESEND_MS) {
      return NextResponse.json(
        { success: false, error: 'Kod zaten gönderildi. Lütfen 1 dakika bekleyin.' },
        { status: 429 }
      );
    }

    const code = randomOtpCode();
    const salt = randomSalt();
    const codeHash = hashOtp(code, salt);
    const expiresAt = new Date(now + OTP_TTL_MS);

    await prisma.smsOtp.create({
      data: {
        phone,
        codeHash,
        salt,
        expiresAt
      }
    });

    const message = `Otosipsak doğrulama kodunuz: ${code}. Kod 5 dakika geçerlidir.`;
    await sendSms(phone, message);

    return NextResponse.json({
      success: true,
      message: 'Doğrulama kodu gönderildi'
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'SMS gönderilemedi';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

