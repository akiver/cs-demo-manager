import fs from 'fs-extra';
import { gunzip } from 'node:zlib';
import { promisify } from 'node:util';
import type { Game } from 'csdm/common/types/counter-strike';
import { type MapBombDamage } from 'csdm/common/types/map-bomb-damage';
import { getMapBombDamageFilePath } from './get-map-bomb-damage-file-path';

const gunzipAsync = promisify(gunzip);

export async function readMapBombDamage(mapName: string, game: Game): Promise<MapBombDamage | null> {
  const filePath = await getMapBombDamageFilePath(mapName, game);
  if (filePath === undefined) {
    return null;
  }

  try {
    const compressedBuffer = await fs.readFile(filePath);
    const buffer = await gunzipAsync(compressedBuffer);
    const data: MapBombDamage = JSON.parse(buffer.toString('utf8'));
    if (data.version !== 1) {
      logger.warn(`Unsupported bomb damage data version ${data.version} in ${filePath}`);
      return null;
    }
    if (typeof data.minNetworkProtocol !== 'number') {
      logger.warn(`Missing minNetworkProtocol in ${filePath}`);
      return null;
    }

    return data;
  } catch (error) {
    logger.warn(`Failed to read bomb damage data from ${filePath}`);
    logger.warn(error);
    return null;
  }
}
