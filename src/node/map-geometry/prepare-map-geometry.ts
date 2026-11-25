import path from 'node:path';
import crypto from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import fs from 'fs-extra';
import { Agent, interceptors, request } from 'undici';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';
import { getMapGeometryManifestEntry, MAP_GEOMETRY_BASE_URL } from './map-geometry-manifest';

type Options = {
  mapName: string;
  onDownloadStart?: (mapName: string) => void;
};

type FileChecksum = {
  mtimeMs: number;
  size: number;
  sha256: string;
};

// Hashing a 40 MB file takes a while, the checksum of the files is kept as long as they don't change.
const fileChecksums = new Map<string, FileChecksum>();

async function getFileSha256(filePath: string) {
  const stats = await fs.stat(filePath);
  const cached = fileChecksums.get(filePath);
  if (cached && cached.mtimeMs === stats.mtimeMs && cached.size === stats.size) {
    return cached.sha256;
  }

  const hash = crypto.createHash('sha256');
  await pipeline(fs.createReadStream(filePath), hash);
  const sha256 = hash.digest('hex');
  fileChecksums.set(filePath, { mtimeMs: stats.mtimeMs, size: stats.size, sha256 });

  return sha256;
}

async function downloadGeometryFile(
  url: string,
  destinationPath: string,
  expectedSize: number,
  expectedSha256: string,
) {
  const timeoutMs = 10_000;
  const response = await request(url, {
    dispatcher: new Agent().compose(interceptors.redirect({ maxRedirections: 1 })),
    bodyTimeout: timeoutMs,
    headersTimeout: timeoutMs,
  });
  if (response.statusCode !== 200) {
    await response.body.dump();
    throw new Error(`Failed to download ${url}, status code: ${response.statusCode}`);
  }

  const partialPath = `${destinationPath}.csdm-partial`;
  try {
    const hash = crypto.createHash('sha256');
    let size = 0;
    await pipeline(
      response.body,
      async function* (source: AsyncIterable<Buffer>) {
        for await (const chunk of source) {
          hash.update(chunk);
          size += chunk.length;
          yield chunk;
        }
      },
      fs.createWriteStream(partialPath),
    );

    const sha256 = hash.digest('hex');
    if (size !== expectedSize || sha256 !== expectedSha256) {
      throw new Error(`Invalid map geometry file ${url}, size: ${size}, sha256: ${sha256}`);
    }

    await fs.move(partialPath, destinationPath, { overwrite: true });
    const stats = await fs.stat(destinationPath);
    fileChecksums.set(destinationPath, { mtimeMs: stats.mtimeMs, size, sha256 });
  } finally {
    await fs.remove(partialPath);
  }
}

async function prepare({ mapName, onDownloadStart }: Options) {
  const folderPath = path.join(getAppFolderPath(), 'map-geometry');
  await fs.ensureDir(folderPath);

  const fileName = `${mapName}.tri`;
  const filePath = path.join(folderPath, fileName);
  const fileExists = await fs.pathExists(filePath);
  const entry = await getMapGeometryManifestEntry(folderPath, mapName);
  // Maps that are not in the manifest may have been added manually, e.g. a workshop map.
  if (!entry) {
    return fileExists ? folderPath : undefined;
  }

  if (fileExists && (await getFileSha256(filePath)) === entry.sha256) {
    return folderPath;
  }

  try {
    onDownloadStart?.(mapName);
    await downloadGeometryFile(`${MAP_GEOMETRY_BASE_URL}/${entry.file}`, filePath, entry.size, entry.sha256);
    return folderPath;
  } catch (error) {
    logger.error(`Failed to download the map geometry of ${mapName}`);
    logger.error(error);
    // An outdated geometry is better than nothing.
    return fileExists ? folderPath : undefined;
  }
}

const pendingPreparations = new Map<string, Promise<string | undefined>>();

/**
 * Makes sure the collision geometry of the map is available and up to date, downloading it if needed.
 * Returns the folder containing the geometry files to give to the demo analyzer, or undefined if the map geometry is
 * not available. It never throws, the analysis must not fail because of the map geometry.
 */
export async function prepareMapGeometry({ mapName, onDownloadStart }: Options): Promise<string | undefined> {
  const namNameRegex = /^[\w-]+$/; // Map names are alphanumeric with underscores and dashes, e.g. de_dust2, cs_office, workshop/1234567890.
  if (!namNameRegex.test(mapName)) {
    return undefined;
  }

  // Several analyses of demos on the same map may run in parallel, download the file only once.
  let promise = pendingPreparations.get(mapName);
  if (!promise) {
    promise = prepare({ mapName, onDownloadStart })
      .catch((error) => {
        logger.error(`Failed to prepare the map geometry of ${mapName}`);
        logger.error(error);
        return undefined;
      })
      .finally(() => {
        pendingPreparations.delete(mapName);
      });
    pendingPreparations.set(mapName, promise);
  }

  return promise;
}
