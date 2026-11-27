import fs from 'fs-extra';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createGunzip } from 'node:zlib';
import { runProcess } from './run-process';

async function readMagic(filePath: string, length: number) {
  const handle = await fs.promises.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(length);
    await handle.read(buffer, 0, length, 0);
    return buffer;
  } finally {
    await handle.close();
  }
}

async function findLargestDemo(folderPath: string): Promise<string | null> {
  let best: { filePath: string; size: number } | null = null;
  const walk = async (folder: string) => {
    for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
      const entryPath = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (entry.name.toLowerCase().endsWith('.dem')) {
        const { size } = await fs.stat(entryPath);
        if (!best || size > best.size) {
          best = { filePath: entryPath, size };
        }
      }
    }
  };
  await walk(folderPath);

  return (best as { filePath: string } | null)?.filePath ?? null;
}

type Options = {
  url: string;
  matchId: string;
  demosFolderPath: string;
  keep: number;
  signal?: AbortSignal;
  onProgress?: (bytes: number, total: number) => void;
};

/**
 * Downloads a match demo (zip with the .dem inside, .dem.gz or plain .dem) to <demosFolderPath>/<matchId>.dem.
 * Demos are cached: more clips from one match skip the download, and the analysis too (same checksum).
 */
export async function downloadMatchDemo({ url, matchId, demosFolderPath, keep, signal, onProgress }: Options) {
  await fs.ensureDir(demosFolderPath);
  const safeName = matchId.replace(/[^\w.-]/g, '_');
  const demoPath = path.join(demosFolderPath, `${safeName}.dem`);
  if ((await fs.pathExists(demoPath)) && (await fs.stat(demoPath)).size > 1024) {
    const now = new Date();
    await fs.utimes(demoPath, now, now);
    return { demoPath, cached: true };
  }

  const downloadPath = path.join(demosFolderPath, `${safeName}.download`);
  const response = await fetch(url, { signal });
  if (!response.ok || !response.body) {
    throw new Error(`Demo download failed: HTTP ${response.status}`);
  }
  const total = Number(response.headers.get('content-length') ?? 0);
  let received = 0;
  let lastReport = 0;
  const meter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      received += chunk.length;
      if (onProgress && Date.now() - lastReport > 1000) {
        lastReport = Date.now();
        onProgress(received, total);
      }
      callback(null, chunk);
    },
  });
  await pipeline(Readable.fromWeb(response.body as never), meter, fs.createWriteStream(downloadPath));
  onProgress?.(received, total);

  const head = await readMagic(downloadPath, 4);
  if (head[0] === 0x50 && head[1] === 0x4b) {
    const extractFolderPath = path.join(demosFolderPath, `${safeName}.unzip`);
    await fs.remove(extractFolderPath);
    await fs.ensureDir(extractFolderPath);
    // Windows 10+ ships bsdtar, which reads zip archives.
    const result =
      process.platform === 'win32'
        ? await runProcess('tar', ['-xf', downloadPath, '-C', extractFolderPath])
        : await runProcess('unzip', ['-o', '-q', downloadPath, '-d', extractFolderPath]);
    if (result.code !== 0) {
      throw new Error(`Could not unzip the demo: ${result.output.slice(-400)}`);
    }
    const found = await findLargestDemo(extractFolderPath);
    if (!found) {
      throw new Error('The demo archive has no .dem file in it.');
    }
    await fs.move(found, demoPath, { overwrite: true });
    await fs.remove(extractFolderPath);
    await fs.remove(downloadPath);
  } else if (head[0] === 0x1f && head[1] === 0x8b) {
    await pipeline(fs.createReadStream(downloadPath), createGunzip(), fs.createWriteStream(demoPath));
    await fs.remove(downloadPath);
  } else {
    await fs.move(downloadPath, demoPath, { overwrite: true });
  }

  const magic = (await readMagic(demoPath, 8)).toString('latin1');
  if (!magic.startsWith('PBDEMS2') && !magic.startsWith('HL2DEMO')) {
    throw new Error('The downloaded file is not a Counter-Strike demo.');
  }
  await pruneDemos(demosFolderPath, keep, demoPath);

  return { demoPath, cached: false };
}

async function pruneDemos(folderPath: string, keep: number, currentDemoPath: string) {
  const files: { filePath: string; time: number }[] = [];
  for (const name of await fs.readdir(folderPath)) {
    if (!name.endsWith('.dem')) {
      continue;
    }
    const filePath = path.join(folderPath, name);
    const stats = await fs.stat(filePath).catch(() => null);
    if (stats) {
      files.push({ filePath, time: stats.mtimeMs });
    }
  }
  files.sort((a, b) => b.time - a.time);
  for (const file of files.slice(Math.max(1, keep))) {
    if (file.filePath !== currentDemoPath) {
      await fs.remove(file.filePath).catch(() => undefined);
    }
  }
}
