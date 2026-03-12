import { IMAGE_UPLOAD_ALLOWED_TYPES_LABEL, IMAGE_UPLOAD_RULES } from '@/lib/image-upload-rules';

type ValidateOptions = {
  maxFiles?: number;
  currentCount?: number;
};

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Gorsel okunamadi.'));
      img.src = objectUrl;
    });

    return dimensions;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function validateImageFiles(
  filesInput: File[] | FileList,
  options: ValidateOptions = {}
): Promise<string | null> {
  const files = Array.from(filesInput);

  if (!files.length) return null;

  const totalCount = (options.currentCount ?? 0) + files.length;
  if (options.maxFiles && totalCount > options.maxFiles) {
    return `En fazla ${options.maxFiles} fotograf yukleyebilirsiniz.`;
  }

  for (const file of files) {
    if (!IMAGE_UPLOAD_RULES.allowedMimeTypes.includes(file.type as (typeof IMAGE_UPLOAD_RULES.allowedMimeTypes)[number])) {
      return `${file.name}: Sadece ${IMAGE_UPLOAD_ALLOWED_TYPES_LABEL} dosyalari kabul edilir.`;
    }

    if (file.size > IMAGE_UPLOAD_RULES.maxBytes) {
      return `${file.name}: Dosya boyutu 10 MB'dan buyuk olamaz.`;
    }

    if (file.size < IMAGE_UPLOAD_RULES.minBytes) {
      return `${file.name}: Dosya boyutu cok kucuk. Daha kaliteli bir fotograf yukleyin.`;
    }

    const { width, height } = await getImageDimensions(file);
    if (width < IMAGE_UPLOAD_RULES.minWidth || height < IMAGE_UPLOAD_RULES.minHeight) {
      return `${file.name}: Gorsel cozunurlugu en az ${IMAGE_UPLOAD_RULES.minWidth}x${IMAGE_UPLOAD_RULES.minHeight} px olmalidir.`;
    }
  }

  return null;
}
