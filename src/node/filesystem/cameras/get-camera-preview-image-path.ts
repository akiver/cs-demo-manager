import path from 'node:path';
import fs from 'fs-extra';
import { getCamerasPreviewsFolderPath } from './get-cameras-previews-folder-path';
import type { ColumnID } from 'csdm/common/types/column-id';

export async function getCameraPreviewImagePath(cameraId: ColumnID) {
  const previewsFolderPath = getCamerasPreviewsFolderPath();

  const extensions = ['png', 'jpg'];
  for (const ext of extensions) {
    const filePath = path.join(previewsFolderPath, `${cameraId}.${ext}`);
    const fileExists = await fs.pathExists(filePath);
    if (fileExists) {
      return filePath;
    }
  }

  return null;
}
