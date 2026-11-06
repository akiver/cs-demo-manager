// Parsing of the baked C4 shockwave data that CS2 ships inside each defusal map since the July 2026 bomb damage
// rework (maps/<map>/baked_bomb_damage.vdata, decompiled to KV3 text with Source2Viewer) and conversion to the
// format used by the app (see src/common/types/map-bomb-damage.ts).
//
// Source format (versions 1 and 2 share the same layout, all little-endian):
//   bombsites      7 float32 per site (1 or 2 sites): bbox mins xyz, bbox maxs xyz, lethal reach.
//   positions      N x 3 int16: sample points on a 10 unit grid, z is the floor height.
//   damage_values  site-major, N x 4 bytes per site: uint16 shockwave travel distance from
//                  the site (0xFFFF when the shockwave never reaches the sample), uint8 arrival yaw
//                  (360/256 degrees per step), int8 arrival pitch.
// The game converts the travel distance into HP at runtime, no HP value is stored.
//
// The baked data doesn't tell which site is A or B and the sites aren't always in A, B order (Cache, Train).
// The letters come from the func_bomb_target entities of the map (maps/<map>/entities/default_ents), see
// findSiteLetters.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

function readByteArray(text, key) {
  const keyIndex = text.indexOf(`${key} =`);
  if (keyIndex === -1) {
    throw new Error(`Key "${key}" not found`);
  }
  const start = text.indexOf('#[', keyIndex);
  const end = text.indexOf(']', start);
  if (start === -1 || end === -1) {
    throw new Error(`Byte array for "${key}" not found`);
  }
  const hexBytes = text
    .slice(start + 2, end)
    .trim()
    .split(/\s+/);

  return Buffer.from(hexBytes.map((hex) => parseInt(hex, 16)));
}

function readVersion(text) {
  const match = text.match(/version\s*=\s*(\d+)/);

  return match ? Number(match[1]) : undefined;
}

function parseBombSites(buffer) {
  const sites = [];
  const siteFloatCount = 7;
  const siteCount = buffer.length / (siteFloatCount * 4);
  for (let i = 0; i < siteCount; i++) {
    const offset = i * siteFloatCount * 4;
    const floats = [];
    for (let j = 0; j < siteFloatCount; j++) {
      floats.push(buffer.readFloatLE(offset + j * 4));
    }
    sites.push({
      mins: floats.slice(0, 3),
      maxs: floats.slice(3, 6),
      lethalReach: floats[6],
    });
  }

  return sites;
}

function parsePositions(buffer) {
  const positions = [];
  const positionByteSize = 6;
  const count = buffer.length / positionByteSize;
  for (let i = 0; i < count; i++) {
    const offset = i * positionByteSize;
    positions.push([buffer.readInt16LE(offset), buffer.readInt16LE(offset + 2), buffer.readInt16LE(offset + 4)]);
  }

  return positions;
}

function parseDamageValues(buffer, siteCount, positionCount) {
  const sampleByteSize = 4;
  const expectedLength = siteCount * positionCount * sampleByteSize;
  if (buffer.length !== expectedLength) {
    throw new Error(`Unexpected damage_values length ${buffer.length}, expected ${expectedLength}`);
  }

  const perSite = [];
  for (let site = 0; site < siteCount; site++) {
    const samples = [];
    for (let i = 0; i < positionCount; i++) {
      const offset = (site * positionCount + i) * sampleByteSize;
      samples.push({
        distance: buffer.readUInt16LE(offset),
        yaw: (buffer.readUInt8(offset + 2) * 360) / 256,
        pitch: buffer.readInt8(offset + 3),
      });
    }
    perSite.push(samples);
  }

  return perSite;
}

function computeGrid(positions) {
  const xs = positions.map((p) => p[0]);
  const ys = positions.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const sortedX = [...new Set(xs)].sort((a, b) => a - b);
  const cellSize = sortedX.length > 1 ? sortedX[1] - sortedX[0] : 0;
  if (cellSize === 0) {
    throw new Error('Unable to detect the grid cell size');
  }

  return {
    cellSize,
    minX,
    maxX,
    minY,
    maxY,
    columns: (maxX - minX) / cellSize + 1,
    rows: (maxY - minY) / cellSize + 1,
  };
}

export function parseBakedBombDamage(fileBuffer) {
  const text = fileBuffer.toString('utf8');
  if (!text.includes('CS2_BOMB_DAMAGE_DATA')) {
    throw new Error('Not a CS2_BOMB_DAMAGE_DATA file');
  }

  const sourceVersion = readVersion(text);
  const sites = parseBombSites(readByteArray(text, 'bombsites'));
  const positions = parsePositions(readByteArray(text, 'positions'));
  const damagePerSite = parseDamageValues(readByteArray(text, 'damage_values'), sites.length, positions.length);

  return {
    sourceVersion,
    sourceSha256: createHash('sha256').update(fileBuffer).digest('hex'),
    sites,
    positions,
    damagePerSite,
    grid: computeGrid(positions),
  };
}

function toBase64(typedArray) {
  return Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength).toString('base64');
}

function buildLayer(level, { grid, sites, positions, damagePerSite }, isInLayer) {
  const cellCount = grid.columns * grid.rows;
  const floorZ = new Int16Array(cellCount);
  const hasFloor = new Uint8Array(cellCount);
  const noFloor = 0xffff;
  const distances = sites.map(() => new Uint16Array(cellCount).fill(noFloor));

  for (let i = 0; i < positions.length; i++) {
    const [x, y, z] = positions[i];
    if (!isInLayer(z)) {
      continue;
    }
    const column = (x - grid.minX) / grid.cellSize;
    const row = (grid.maxY - y) / grid.cellSize;
    const cell = row * grid.columns + column;
    // Several floors may be stacked in the same cell, keep the highest one as it's the visible one on the radar.
    if (hasFloor[cell] && floorZ[cell] >= z) {
      continue;
    }
    hasFloor[cell] = 1;
    floorZ[cell] = z;
    for (let site = 0; site < sites.length; site++) {
      distances[site][cell] = damagePerSite[site][i].distance;
    }
  }

  return {
    level,
    floorZ: toBase64(floorZ),
    distances: distances.map(toBase64),
  };
}

/**
 * Parses the func_bomb_target entities of a map entity lump decompiled to text (default_ents.vents).
 * bomb_site_designation is 0 for A and 1 for B, bomb_damage_power is the lethal reach of the site in the baked data.
 */
export function parseBombTargets(entitiesText) {
  const siteLetterByDesignation = { 0: 'A', 1: 'B' };

  return entitiesText
    .split(/^====\d+====\s*$/m)
    .filter((block) => /^classname\s+"func_bomb_target"\s*$/m.test(block))
    .map((block) => ({
      letter: siteLetterByDesignation[block.match(/^bomb_site_designation\s+"(\d+)"/m)?.[1]],
      damagePower: Number(block.match(/^bomb_damage_power\s+([\d.]+)/m)?.[1]),
    }));
}

export function findSiteLetters(sites, bombTargets) {
  const letters = sites.map((site, index) => {
    const targets = bombTargets.filter((target) => Math.abs(target.damagePower - site.lethalReach) < 0.5);
    if (targets.length !== 1) {
      throw new Error(
        `Site #${index + 1} (lethal reach ${site.lethalReach}) matches ${targets.length} func_bomb_target, bomb targets: ${JSON.stringify(bombTargets)}`,
      );
    }
    if (targets[0].letter === undefined) {
      throw new Error(`Unknown bomb_site_designation for site #${index + 1}`);
    }

    return targets[0].letter;
  });
  if (new Set(letters).size !== letters.length) {
    throw new Error(`Duplicated site letters ${letters.join(', ')}`);
  }

  return letters;
}

/**
 * Builds the app data from parsed baked data.
 * minNetworkProtocol: network protocol of the CS2 update that baked the data into the map for the first time.
 * thresholdZ: Z coordinate below which samples belong to the lower radar (maps with 2 levels only).
 * siteLetters: letter of each baked site, see findSiteLetters.
 */
export function buildMapBombDamage(parsed, { minNetworkProtocol, thresholdZ, siteLetters }) {
  if (!Number.isInteger(minNetworkProtocol)) {
    throw new Error(`Invalid minNetworkProtocol ${minNetworkProtocol}`);
  }
  if (siteLetters?.length !== parsed.sites.length) {
    throw new Error(`Expected ${parsed.sites.length} site letters, got ${siteLetters?.length}`);
  }

  const layers = [];
  if (thresholdZ === undefined || Number.isNaN(thresholdZ)) {
    layers.push(buildLayer('upper', parsed, () => true));
  } else {
    layers.push(buildLayer('upper', parsed, (z) => z >= thresholdZ));
    layers.push(buildLayer('lower', parsed, (z) => z < thresholdZ));
  }

  const { grid, sites } = parsed;

  return {
    version: 1, // Keep in sync with src/node/filesystem/maps/read-map-bomb-damage.ts
    sourceSha256: parsed.sourceSha256,
    minNetworkProtocol,
    grid: {
      originX: grid.minX - grid.cellSize / 2,
      originY: grid.maxY + grid.cellSize / 2,
      cellSize: grid.cellSize,
      columns: grid.columns,
      rows: grid.rows,
    },
    sites: sites.map(({ mins, maxs, lethalReach }, index) => ({
      letter: siteLetters[index],
      min: { x: mins[0], y: mins[1], z: mins[2] },
      max: { x: maxs[0], y: maxs[1], z: maxs[2] },
      lethalReach,
    })),
    layers,
  };
}

export function getMapBombDamageOutputPath(rootFolderPath, game, mapName) {
  return path.join(rootFolderPath, 'static', 'maps', game, 'bomb-damage', `${mapName}.json.gz`);
}

export async function writeMapBombDamage(data, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, gzipSync(JSON.stringify(data), { level: 9 }));
  const { size } = await fs.stat(outputPath);

  return size;
}

export function describeParsedData({ sites, positions, grid }) {
  const sitesDescription = sites
    .map((site, index) => `#${index + 1} at ${site.mins.map(Math.round)} (lethal reach ${site.lethalReach})`)
    .join(', ');

  return `${positions.length} samples on a ${grid.cellSize} unit grid (${grid.columns} x ${grid.rows}), sites: ${sitesDescription}`;
}
