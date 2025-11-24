import path from 'node:path';
import fs from 'fs-extra';
import { getCamerasPreviewsFolderPath } from './get-cameras-previews-folder-path';
import type { ColumnID } from 'csdm/common/types/column-id';
import { getUserCamerasFolderPath } from './get-user-cameras-folder-path';

async function getCameraImagePathInAppFolder(cameraId: ColumnID) {
  const previewsFolderPath = getCamerasPreviewsFolderPath();
  const imageFilePath = path.join(previewsFolderPath, `${cameraId}.png`);
  const imageFileExists = await fs.pathExists(imageFilePath);

  return imageFileExists ? imageFilePath : null;
}

async function getCameraImagePathInUserFolder(cameraId: ColumnID) {
  const previewsFolderPath = getUserCamerasFolderPath();
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

export async function getCameraPreviewImagePath(cameraId: ColumnID) {
  const imageFilePathInUserFolder = await getCameraImagePathInUserFolder(cameraId);
  if (imageFilePathInUserFolder) {
    return imageFilePathInUserFolder;
  }

  const imageFilePathInAppFolder = await getCameraImagePathInAppFolder(cameraId);
  return imageFilePathInAppFolder;
}
