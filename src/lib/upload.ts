import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { put } from '@vercel/blob';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

type SavedFile = { filename: string; url: string };

/**
 * Vercel Production:
 * - Local FS'e yazılamaz (serverless). Bu yüzden Vercel Blob kullanılır.
 *
 * Local Development:
 * - BLOB_READ_WRITE_TOKEN yoksa /public/uploads'a yazar.
 */
export async function saveUploadFiles(files: File[]): Promise<SavedFile[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const saved: SavedFile[] = [];

  // Prod/Vercel: Blob
  if (token) {
    for (const file of files) {
      const ext = path.extname(file.name) || '.dat';
      const filename = `${randomUUID()}${ext}`;
      const blob = await put(`uploads/${filename}`, file, { access: 'public', token });
      saved.push({ filename, url: blob.url });
    }
    return saved;
  }

  // Vercel production ortaminda local dosya sistemi kalici degildir.
  if (process.env.VERCEL) {
    throw new Error('BLOB_READ_WRITE_TOKEN eksik. Uretimde gorsel yuklemek icin Vercel Blob token gerekli.');
  }

  // Local: FS
  ensureUploadDir();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = path.extname(file.name) || '.dat';
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    saved.push({ filename, url: `/uploads/${filename}` });
  }

  return saved;
}

