import path from 'node:path';
import fs from 'fs-extra';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

type DaemonInfo = {
  port: number;
  pid: number;
  version: string;
};

export function getDaemonInfoFilePath() {
  return path.join(getAppFolderPath(), 'daemon.json');
}

export async function writeDaemonInfoFile(info: DaemonInfo) {
  await fs.ensureDir(getAppFolderPath());
  // Write to a temporary file then rename it so concurrent readers polling the file never observe a partial write.
  const filePath = getDaemonInfoFilePath();
  const temporaryFilePath = `${filePath}.${process.pid}.tmp`;
  await fs.writeFile(temporaryFilePath, JSON.stringify(info));
  await fs.rename(temporaryFilePath, filePath);
}

export function parseDaemonInfo(content: string): DaemonInfo | null {
  try {
    const { port, pid, version }: Partial<Record<keyof DaemonInfo, unknown>> = JSON.parse(content) ?? {};
    if (typeof port === 'number' && typeof pid === 'number' && typeof version === 'string') {
      return { port, pid, version };
    }

    return null;
  } catch {
    return null;
  }
}

export async function readDaemonInfoFile(): Promise<DaemonInfo | null> {
  try {
    const content = await fs.readFile(getDaemonInfoFilePath(), 'utf8');

    return parseDaemonInfo(content);
  } catch {
    return null;
  }
}

export async function deleteDaemonInfoFile() {
  try {
    await fs.remove(getDaemonInfoFilePath());
  } catch (error) {
    logger.error('Error while deleting the daemon info file');
    logger.error(error);
  }
}
