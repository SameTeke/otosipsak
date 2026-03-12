import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveUploadFiles } from '@/lib/upload';

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  try {
    const listingId = Number(params.id);
    if (!Number.isFinite(listingId)) {
      return NextResponse.json({ error: 'Gecersiz ilan numarasi' }, { status: 400 });
    }

    const form = await req.formData();
    const files = form.getAll('files') as File[];
    if (!files.length) return NextResponse.json({ ok: true, files: [] });

    const saved = await saveUploadFiles(files);
    await prisma.listingImage.createMany({
      data: saved.map((s) => ({ url: s.url, listingId }))
    });

    return NextResponse.json({ ok: true, files: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gorseller yuklenemedi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

