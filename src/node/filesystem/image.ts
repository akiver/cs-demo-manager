import path from 'node:path';
import fs from 'fs-extra';

export type ImageFormat = 'png' | 'jpeg';

export function isPngBase64String(value: string): boolean {
  return value.startsWith('data:image/png;base64,');
}

export function getImageFormatFromBase64(base64: string): ImageFormat | null {
  if (base64.startsWith('data:image/png;base64,')) {
    return 'png';
  }

  if (base64.startsWith('data:image/jpeg;base64,') || base64.startsWith('data:image/jpg;base64,')) {
    return 'jpeg';
  }

  return null;
}

export async function readImageFile(filePath: string): Promise<Buffer<ArrayBuffer>> {
  const extensions = ['.png', '.jpg', '.jpeg'];
  const extension = path.extname(filePath).toLowerCase();
  if (!extensions.includes(extension)) {
    throw new Error(`Unsupported image format: ${extension}`);
  }
  const data = await fs.readFile(filePath);
  return data;
}
