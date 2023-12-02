import os from 'node:os';
import { request } from 'undici';
import path from 'node:path';
import fs from 'node:fs/promises';
import StreamZip from 'node-stream-zip';

export async function downloadAndExtractZipArchive(archiveUrl: string, destinationPath: string) {
  let response = await request(archiveUrl);
  if (response.body === null) {
    throw new Error('Request body not defined while downloading zip archive');
  }

  const isRedirection = response.statusCode === 301 || response.statusCode === 302;
  if (isRedirection && typeof response.headers.location === 'string') {
    response = await request(response.headers.location);
  }

  const filename = path.basename(archiveUrl);
  const zipPath = path.join(os.tmpdir(), filename);
  await fs.writeFile(zipPath, response.body);

  const zip = new StreamZip.async({
    file: zipPath,
  });

  await fs.mkdir(destinationPath, { recursive: true });
  await zip.extract(null, destinationPath);
  await zip.close();
}
