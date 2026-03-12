export const IMAGE_UPLOAD_RULES = {
  minBytes: 120 * 1024,
  maxBytes: 10 * 1024 * 1024,
  minWidth: 1200,
  minHeight: 900,
  outputWidth: 1600,
  outputHeight: 1200,
  quality: 80,
  maxVehiclePhotos: 6,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
} as const;

export const IMAGE_UPLOAD_ALLOWED_TYPES_LABEL = 'JPG, PNG veya WEBP';

export const IMAGE_UPLOAD_REQUIREMENTS_TEXT =
  'Sistem gorselleri otomatik olarak 4:3 oraninda optimize eder. En az 1200x900 px, en fazla 10 MB, en az 120 KB ve sadece JPG/PNG/WEBP kabul edilir.';
