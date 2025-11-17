import fs from 'fs-extra';
import path from 'node:path';
import { getCameraPreviewImagePath } from './get-camera-preview-image-path';

export async function getCameraPreviewBase64(cameraId: string) {
  const filePath = await getCameraPreviewImagePath(cameraId);
  if (!filePath) {
    return null;
  }

  const data = await fs.readFile(filePath, 'base64');
  const extension = path.extname(filePath).toLowerCase();
  const mimeType = ['.jpg', '.jpeg'].includes(extension) ? 'image/jpeg' : 'image/png';

  return `data:${mimeType};base64,${data}`;
}
