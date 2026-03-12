import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { IMAGE_UPLOAD_ALLOWED_TYPES_LABEL, IMAGE_UPLOAD_RULES } from '@/lib/image-upload-rules';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

type SavedFile = { filename: string; url: string };

function normalizeFilename(name: string) {
  return (
    path
      .parse(name)
      .name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'gorsel'
  );
}

async function optimizeImage(file: File) {
  if (!IMAGE_UPLOAD_RULES.allowedMimeTypes.includes(file.type as (typeof IMAGE_UPLOAD_RULES.allowedMimeTypes)[number])) {
    throw new Error(`Sadece ${IMAGE_UPLOAD_ALLOWED_TYPES_LABEL} dosyalari kabul edilir.`);
  }

  if (file.size > IMAGE_UPLOAD_RULES.maxBytes) {
    throw new Error('Dosya boyutu 10 MB\'dan buyuk olamaz.');
  }

  if (file.size < IMAGE_UPLOAD_RULES.minBytes) {
    throw new Error('Dosya boyutu cok kucuk. Daha kaliteli bir fotograf yukleyin.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);
  const image = sharp(inputBuffer).rotate();
  const metadata = await image.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  if (width < IMAGE_UPLOAD_RULES.minWidth || height < IMAGE_UPLOAD_RULES.minHeight) {
    throw new Error(
      `Gorsel cozunurlugu en az ${IMAGE_UPLOAD_RULES.minWidth}x${IMAGE_UPLOAD_RULES.minHeight} px olmalidir.`
    );
  }

  const optimizedBuffer = await image
    .resize(IMAGE_UPLOAD_RULES.outputWidth, IMAGE_UPLOAD_RULES.outputHeight, {
      fit: 'cover',
      position: 'attention',
      withoutEnlargement: true
    })
    .webp({ quality: IMAGE_UPLOAD_RULES.quality })
    .toBuffer();

  return optimizedBuffer;
}

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
      const optimizedBuffer = await optimizeImage(file);
      const filename = `${normalizeFilename(file.name)}-${randomUUID()}.webp`;
      const blob = await put(`uploads/${filename}`, optimizedBuffer, {
        access: 'public',
        token,
        contentType: 'image/webp'
      });
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
    const buffer = await optimizeImage(file);
    const filename = `${normalizeFilename(file.name)}-${randomUUID()}.webp`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    saved.push({ filename, url: `/uploads/${filename}` });
  }

  return saved;
}

