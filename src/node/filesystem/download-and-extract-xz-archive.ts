import util from 'node:util';
import { pipeline } from 'node:stream';
import { Agent, interceptors, request } from 'undici';
import fs from 'fs-extra';
import path from 'node:path';
import { exec } from 'node:child_process';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';
const streamPipeline = util.promisify(pipeline);
const execAsync = util.promisify(exec);

export async function downloadAndExtractXzArchive(archiveUrl: string, destinationPath: string): Promise<void> {
  const response = await request(archiveUrl, {
    dispatcher: new Agent().compose(interceptors.redirect({ maxRedirections: 5 })),
  });
  if (response.statusCode !== 200) {
    await response.body.dump();
    throw new Error(`Error while downloading XZ archive, status code: ${response.statusCode}`);
  }

  const archivePath = path.join(getAppFolderPath(), path.basename(archiveUrl));
  await streamPipeline(response.body, fs.createWriteStream(archivePath));

  await fs.mkdirp(destinationPath);
  await execAsync(`tar -xJf ${archivePath} -C ${destinationPath} --strip=1`);
  await fs.remove(archivePath);
}
