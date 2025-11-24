import path from 'node:path';
import fs from 'node:fs/promises';
import { getCamerasPreviewsFolderPath } from './get-cameras-previews-folder-path';
import type { ImageFormat } from '../image';

export async function writeCameraPreviewImage(cameraId: string, base64: string, format: ImageFormat) {
  const camerasPreviewsFolderPath = getCamerasPreviewsFolderPath();

  const extension = format === 'jpeg' ? 'jpg' : 'png';
  const previewPath = path.join(camerasPreviewsFolderPath, `${cameraId}.${extension}`);
  const base64Data = base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

  await fs.writeFile(previewPath, base64Data, 'base64');
}
