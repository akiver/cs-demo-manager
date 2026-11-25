import path from 'node:path';
import fs from 'fs-extra';

export const MAP_GEOMETRY_BASE_URL = 'https://gitlab.com/akiver/cs2-map-geometry/-/raw/main';
const MANIFEST_FILE_NAME = 'manifest.json';
let lastFailedFetchDate = 0;

type MapGeometryManifestEntry = {
  file: string;
  size: number;
  sha256: string;
};

// https://gitlab.com/akiver/cs2-map-geometry#manifestjson
type MapGeometryManifest = {
  formatVersion: number;
  maps: Record<string, MapGeometryManifestEntry>;
};

function isManifest(value: unknown): value is MapGeometryManifest {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const manifest = value as MapGeometryManifest;
  if (typeof manifest.formatVersion !== 'number' || typeof manifest.maps !== 'object' || manifest.maps === null) {
    return false;
  }

  return Object.values(manifest.maps).every((entry) => {
    return typeof entry?.file === 'string' && typeof entry.size === 'number' && typeof entry.sha256 === 'string';
  });
}

async function readCachedManifest(manifestPath: string) {
  try {
    const manifest: unknown = await fs.readJson(manifestPath);
    return isManifest(manifest) ? manifest : undefined;
  } catch {
    return undefined;
  }
}

async function isCachedManifestExpired(manifestPath: string) {
  try {
    const stats = await fs.stat(manifestPath);
    const expirationMs = 24 * 3600 * 1000;

    return Date.now() - stats.mtimeMs >= expirationMs;
  } catch {
    return true;
  }
}

async function downloadManifest(manifestPath: string) {
  const response = await fetch(`${MAP_GEOMETRY_BASE_URL}/${MANIFEST_FILE_NAME}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch the map geometry manifest, status: ${response.status}`);
  }

  const manifest: unknown = await response.json();
  if (!isManifest(manifest)) {
    throw new Error('Invalid map geometry manifest');
  }

  const temporaryPath = `${manifestPath}.csdm-partial`;
  await fs.writeJson(temporaryPath, manifest);
  await fs.move(temporaryPath, manifestPath, { overwrite: true });

  return manifest;
}

async function getMapGeometryManifest(folderPath: string) {
  const manifestPath = path.join(folderPath, MANIFEST_FILE_NAME);
  const fetchRetryDelayMs = 30 * 60 * 1000;
  const msSinceLastFailedFetch = Date.now() - lastFailedFetchDate;
  const shouldFetch = (await isCachedManifestExpired(manifestPath)) && msSinceLastFailedFetch >= fetchRetryDelayMs;
  if (shouldFetch) {
    try {
      return await downloadManifest(manifestPath);
    } catch (error) {
      lastFailedFetchDate = Date.now();
      logger.error('Failed to fetch the map geometry manifest');
      logger.error(error);
    }
  }

  return readCachedManifest(manifestPath);
}

// Returns the manifest entry of the map, undefined if the map is not in the manifest or the manifest is not available
// or not supported.
export async function getMapGeometryManifestEntry(folderPath: string, mapName: string) {
  const manifest = await getMapGeometryManifest(folderPath);
  if (!manifest) {
    return undefined;
  }

  if (manifest.formatVersion !== 1) {
    logger.log(`Unsupported map geometry format version ${manifest.formatVersion}`);
    return undefined;
  }

  return Object.hasOwn(manifest.maps, mapName) ? manifest.maps[mapName] : undefined;
}
