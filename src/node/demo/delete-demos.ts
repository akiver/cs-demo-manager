import fs from 'fs-extra';
import { DemoNotFound } from 'csdm/node/counter-strike/launcher/errors/demo-not-found';
import type { Demo } from 'csdm/common/types/demo';

export async function deleteDemos(demos: Demo[]) {
  const deletedDemos: Demo[] = [];
  const notDeletedDemos: Demo[] = [];

  for (const demo of demos) {
    try {
      const demoExists = await fs.pathExists(demo.filePath);
      if (!demoExists) {
        throw new DemoNotFound();
      }
      await fs.remove(demo.filePath);
      const infoFilePath = `${demo.filePath}.info`;
      await fs.remove(infoFilePath);
      const vdmFilePath = `${demo.filePath}.vdm`;
      await fs.remove(vdmFilePath);
      deletedDemos.push(demo);
    } catch (error) {
      logger.error(`Error while deleting demo ${demo.filePath}`);
      logger.error(error);
      notDeletedDemos.push(demo);
      continue;
    }
  }

  return { deletedDemos, notDeletedDemos };
}
