import util from 'node:util';
import { pipeline } from 'node:stream';
import { request } from 'undici';
import fs from 'fs-extra';
import path from 'node:path';
import { exec } from 'node:child_process';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';
const streamPipeline = util.promisify(pipeline);
const execAsync = util.promisify(exec);

export async function downloadAndExtractXzArchive(archiveUrl: string, destinationPath: string): Promise<void> {
  let response = await request(archiveUrl);
  const isRedirection = response.statusCode === 301 || response.statusCode === 302;
  if (isRedirection && typeof response.headers.location === 'string') {
    response = await request(response.headers.location);
  }

  const archivePath = path.join(getAppFolderPath(), path.basename(archiveUrl));
  if (response.body) {
    await streamPipeline(response.body, fs.createWriteStream(archivePath));
  } else {
    throw new Error('Error while downloading XZ archive');
  }

  await fs.mkdirp(destinationPath);
  await execAsync(`tar -xJf ${archivePath} -C ${destinationPath} --strip=1`);
  await fs.remove(archivePath);
}
