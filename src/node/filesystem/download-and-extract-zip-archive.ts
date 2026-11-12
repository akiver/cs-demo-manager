import os from 'node:os';
import { Agent, interceptors, request } from 'undici';
import path from 'node:path';
import fs from 'node:fs/promises';
import StreamZip from 'node-stream-zip';

export async function downloadAndExtractZipArchive(archiveUrl: string, destinationPath: string) {
  const response = await request(archiveUrl, {
    dispatcher: new Agent().compose(interceptors.redirect({ maxRedirections: 5 })),
  });
  if (response.statusCode !== 200) {
    await response.body.dump();
    throw new Error(`Error while downloading zip archive, status code: ${response.statusCode}`);
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
