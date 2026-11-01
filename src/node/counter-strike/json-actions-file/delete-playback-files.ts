import fs from 'fs-extra';
import { getTimelineFilePath } from './timeline-file';
import { getCamerasFilePath } from './cameras-file';

export async function deletePlaybackFiles(demoPath: string) {
  await Promise.all([
    fs.remove(`${demoPath}.json`),
    fs.remove(getTimelineFilePath(demoPath)),
    fs.remove(getCamerasFilePath(demoPath)),
  ]);
}
