import { NextResponse } from 'next/server';
import { saveUploadFiles } from '@/lib/upload';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll('file');
    const normalized = files.flatMap((f) => (f instanceof File ? [f] : []));
    if (!normalized.length) {
      return NextResponse.json({ error: 'Dosya yok' }, { status: 400 });
    }

    const saved = await saveUploadFiles(normalized);
    return NextResponse.json({ files: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Yukleme basarisiz';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

