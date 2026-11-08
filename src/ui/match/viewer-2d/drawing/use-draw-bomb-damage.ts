import { useRef } from 'react';
import type { InteractiveCanvas } from 'csdm/ui/hooks/use-interactive-map-canvas';
import type { BombPlanted } from 'csdm/common/types/bomb-planted';
import { useViewerContext } from '../use-viewer-context';
import type { DecodedMapBombDamage, DecodedMapBombDamageLayer } from '../bomb-damage/decode-map-bomb-damage';
import { BOMB_DAMAGE_FALLOFF_DISTANCE, estimateBombDamage } from '../bomb-damage/estimate-bomb-damage';
import { findBombSiteIndex } from '../bomb-damage/find-bomb-site-index';
import { LEGACY_BOMB_RADIUS, getLegacyLethalDistance } from '../bomb-damage/legacy-bomb-damage';
import {
  BOMB_DAMAGE_BANDS,
  BOMB_DAMAGE_LETHAL_BAND,
  getBombDamageBand,
  toRgba,
} from '../bomb-damage/bomb-damage-colors';

// When the bomb explodes, the game grows a sphere from the bomb at this speed and hurts a player on the first tick
// after the sphere reaches them. The sphere is a plain sphere: the delay before a hit depends on the straight-line
// distance between the bomb and the player, not on the path the shockwave takes around walls.
// The baked travel distance only decides how much damage the player takes, not when.
// The speed is used to animate the overlay: the bands are revealed as the sphere expands.
// Value measured from the delay between explosions and C4 hits in demos.
const SHOCKWAVE_SPEED_UNITS_PER_SECOND = 3000;
// Width (in game units) of the bright ring drawn at the front of the shockwave.
const SHOCKWAVE_FRONT_WIDTH = 150;
const FRONT_COLOR = [255, 255, 255];
// Value of a grid cell where there is no floor, i.e. the shockwave never reaches it.
const MAP_BOMB_DAMAGE_NO_FLOOR = 0xffff;

function fillRing(context: CanvasRenderingContext2D, x: number, y: number, innerRadius: number, outerRadius: number) {
  context.beginPath();
  context.arc(x, y, outerRadius, 0, Math.PI * 2);
  context.arc(x, y, innerRadius, 0, Math.PI * 2, true);
  context.fill('evenodd');
}

// Legacy model: concentric rings around the bomb, one per damage band, up to the blast radius where the damage stops.
// While the shockwave front is expanding (frontDistance in game units), only the part behind the front is drawn.
function drawLegacyBands(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  unitsToPixels: number,
  frontDistance: number,
) {
  let innerRadius = 0;
  for (const band of BOMB_DAMAGE_BANDS) {
    const outerDistance = Math.min(getLegacyLethalDistance(band.minDamage, false), LEGACY_BOMB_RADIUS, frontDistance);
    const outerRadius = outerDistance * unitsToPixels;
    if (outerRadius <= innerRadius) {
      break;
    }
    context.fillStyle = toRgba(band.color, band.alpha);
    fillRing(context, x, y, innerRadius, outerRadius);
    innerRadius = outerRadius;
  }

  if (Number.isFinite(frontDistance)) {
    const frontOuterDistance = Math.min(frontDistance, LEGACY_BOMB_RADIUS);
    const frontInnerDistance = Math.max(0, frontDistance - SHOCKWAVE_FRONT_WIDTH);
    if (frontOuterDistance > frontInnerDistance) {
      context.fillStyle = toRgba(FRONT_COLOR, 0.9);
      fillRing(context, x, y, frontInnerDistance * unitsToPixels, frontOuterDistance * unitsToPixels);
    }
  }
}

type Position = { x: number; y: number; z: number };

// Radius the shockwave sphere must reach to hit each cell, i.e. the straight-line distance between the bomb and the
// floor of the cell, ignoring walls (unlike the baked travel distance that decides the damage).
// It only depends on the bomb position, so it's computed once per bomb instead of on every frame of the animation.
function computeSphereDistances(grid: DecodedMapBombDamage['grid'], layer: DecodedMapBombDamageLayer, bomb: Position) {
  const { originX, originY, cellSize, columns, rows } = grid;
  const sphereDistances = new Float32Array(columns * rows);
  for (let row = 0; row < rows; row++) {
    const deltaY = originY - (row + 0.5) * cellSize - bomb.y;
    const deltaYSquared = deltaY * deltaY;
    for (let column = 0; column < columns; column++) {
      const cell = row * columns + column;
      const deltaX = originX + (column + 0.5) * cellSize - bomb.x;
      const deltaZ = layer.floorZ[cell] - bomb.z;
      sphereDistances[cell] = Math.sqrt(deltaX * deltaX + deltaYSquared + deltaZ * deltaZ);
    }
  }

  return sphereDistances;
}

type PaintLayerOptions = {
  layer: DecodedMapBombDamageLayer;
  siteIndex: number;
  lethalReach: number;
  sphereDistances: Float32Array;
  // Straight-line distance from the bomb reached by the shockwave front, Infinity to paint the whole blast.
  frontDistance: number;
};

function paintLayer(
  imageData: ImageData,
  { layer, siteIndex, lethalReach, sphereDistances, frontDistance }: PaintLayerOptions,
) {
  const distances = layer.distances[siteIndex];
  const pixels = imageData.data;
  const isFrontExpanding = Number.isFinite(frontDistance);
  const frontStartDistance = frontDistance - SHOCKWAVE_FRONT_WIDTH;

  for (let cell = 0; cell < distances.length; cell++) {
    const offset = cell * 4;
    const distance = distances[cell];
    if (distance === MAP_BOMB_DAMAGE_NO_FLOOR) {
      pixels[offset + 3] = 0;
      continue;
    }

    let isOnFront = false;
    if (isFrontExpanding) {
      const sphereDistance = sphereDistances[cell];
      if (sphereDistance > frontDistance) {
        pixels[offset + 3] = 0;
        continue;
      }
      isOnFront = sphereDistance > frontStartDistance;
    }

    const band = getBombDamageBand(estimateBombDamage(distance, lethalReach));
    if (band === undefined) {
      pixels[offset + 3] = 0;
      continue;
    }

    let { color, alpha } = band;
    if (isOnFront) {
      color = FRONT_COLOR;
      alpha = 0.9;
    }

    pixels[offset] = color[0];
    pixels[offset + 1] = color[1];
    pixels[offset + 2] = color[2];
    pixels[offset + 3] = Math.round(alpha * 255);
  }
}

type LayerCanvas = {
  canvas: HTMLCanvasElement;
  imageData: ImageData;
  // Key of the last painted state to avoid repainting the same frame.
  key: string;
  sphereDistances: Float32Array | null;
  // Bomb position the sphere distances have been computed for.
  sphereDistancesKey: string;
};

type LayerCanvasesCache = {
  // The data the canvases have been created for, the cache is invalidated when it changes (map change).
  data: DecodedMapBombDamage | null;
  layers: LayerCanvas[];
};

export function useDrawBombDamage() {
  const {
    map,
    currentTick,
    tickrate,
    bombPlanted,
    bombExploded,
    bombDefused,
    bombDamage,
    settings: { isBombDamageVisible, bombDamageOpacity },
  } = useViewerContext();
  const cache = useRef<LayerCanvasesCache>({ data: null, layers: [] });

  const getLayerCanvas = (layerIndex: number) => {
    if (bombDamage === null) {
      throw new Error('Bomb damage data not available');
    }

    if (cache.current.data !== bombDamage) {
      cache.current = { data: bombDamage, layers: [] };
    }

    let layerCanvas = cache.current.layers[layerIndex];
    if (!layerCanvas) {
      const canvas = document.createElement('canvas');
      canvas.width = bombDamage.grid.columns;
      canvas.height = bombDamage.grid.rows;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Unable to create 2D context');
      }
      layerCanvas = {
        canvas,
        imageData: context.createImageData(canvas.width, canvas.height),
        key: '',
        sphereDistances: null,
        sphereDistancesKey: '',
      };
      cache.current.layers[layerIndex] = layerCanvas;
    }

    return layerCanvas;
  };

  // Distance (in game units) traveled by the shockwave front since the explosion, Infinity once the animation is over
  // (or before the explosion), i.e. when the whole blast has to be drawn.
  const getFrontDistance = (maxReach: number) => {
    if (bombExploded === null || bombExploded.tick > currentTick) {
      return Number.POSITIVE_INFINITY;
    }

    const secondsElapsed = (currentTick - bombExploded.tick) / tickrate;
    const shockwaveDistance = secondsElapsed * SHOCKWAVE_SPEED_UNITS_PER_SECOND;

    return shockwaveDistance < maxReach + SHOCKWAVE_FRONT_WIDTH ? shockwaveDistance : Number.POSITIVE_INFINITY;
  };

  // The legacy blast is a sphere around the bomb that goes through walls and floors, it's drawn on every radar level.
  const drawLegacyBombDamage = (
    context: CanvasRenderingContext2D,
    { zoomedToRadarX, zoomedToRadarY, zoomedSize }: InteractiveCanvas,
    bombPlanted: BombPlanted,
    alpha: number,
  ) => {
    // Any Z above (upper) or below (lower) the map threshold selects the radar level.
    const levelsZ = map.lowerRadarFilePath === undefined ? [map.thresholdZ] : [map.thresholdZ, map.thresholdZ - 1];
    const armoredLethalDistance = getLegacyLethalDistance(100, true);
    const frontDistance = getFrontDistance(LEGACY_BOMB_RADIUS);

    context.save();
    context.globalAlpha = alpha;
    for (const z of levelsZ) {
      const x = zoomedToRadarX(bombPlanted.x, z);
      const y = zoomedToRadarY(bombPlanted.y, z);
      const unitsToPixels = (zoomedToRadarX(bombPlanted.x + LEGACY_BOMB_RADIUS, z) - x) / LEGACY_BOMB_RADIUS;
      drawLegacyBands(context, x, y, unitsToPixels, frontDistance);

      // Dashed ring where the blast stops killing a player with armor, drawn once the front went past it.
      if (frontDistance >= armoredLethalDistance) {
        context.setLineDash([zoomedSize(8), zoomedSize(6)]);
        context.lineWidth = Math.max(1, zoomedSize(2));
        context.strokeStyle = toRgba(BOMB_DAMAGE_LETHAL_BAND.color, 0.9);
        context.beginPath();
        context.arc(x, y, armoredLethalDistance * unitsToPixels, 0, Math.PI * 2);
        context.stroke();
      }
    }
    context.restore();
  };

  const drawBombDamage = (context: CanvasRenderingContext2D, interactiveCanvas: InteractiveCanvas) => {
    if (!isBombDamageVisible || bombPlanted === null || bombPlanted.tick > currentTick) {
      return;
    }

    const isDefused = bombDefused !== null && bombDefused.tick <= currentTick;
    if (isDefused) {
      return;
    }

    const isExploded = bombExploded !== null && bombExploded.tick <= currentTick;
    // The bomb is planted but didn't explode yet, draw a preview of the blast.
    const alpha = isExploded ? bombDamageOpacity : bombDamageOpacity * 0.5;

    if (bombDamage === null) {
      drawLegacyBombDamage(context, interactiveCanvas, bombPlanted, alpha);
      return;
    }

    const siteIndex = findBombSiteIndex(bombDamage.sites, bombPlanted);
    const site = bombDamage.sites[siteIndex];
    if (!site) {
      return;
    }

    const frontDistance = getFrontDistance(site.lethalReach + BOMB_DAMAGE_FALLOFF_DISTANCE);

    const { zoomedToRadarX, zoomedToRadarY } = interactiveCanvas;
    const { grid } = bombDamage;
    context.save();
    context.globalAlpha = alpha;

    bombDamage.layers.forEach((layer, layerIndex) => {
      if (layer.level === 'lower' && map.lowerRadarFilePath === undefined) {
        return;
      }

      const layerCanvas = getLayerCanvas(layerIndex);
      const frontKey = Number.isFinite(frontDistance) ? Math.round(frontDistance) : 'full';
      const key = `${siteIndex}-${frontKey}`;
      if (layerCanvas.key !== key) {
        const bombKey = `${bombPlanted.x}_${bombPlanted.y}_${bombPlanted.z}`;
        if (layerCanvas.sphereDistances === null || layerCanvas.sphereDistancesKey !== bombKey) {
          layerCanvas.sphereDistances = computeSphereDistances(grid, layer, bombPlanted);
          layerCanvas.sphereDistancesKey = bombKey;
        }
        paintLayer(layerCanvas.imageData, {
          layer,
          siteIndex,
          lethalReach: site.lethalReach,
          sphereDistances: layerCanvas.sphereDistances,
          frontDistance,
        });
        layerCanvas.canvas.getContext('2d')?.putImageData(layerCanvas.imageData, 0, 0);
        layerCanvas.key = key;
      }

      // Any Z above (upper) or below (lower) the map threshold selects the right radar level.
      const z = layer.level === 'lower' ? map.thresholdZ - 1 : map.thresholdZ;
      const left = zoomedToRadarX(grid.originX, z);
      const top = zoomedToRadarY(grid.originY, z);
      const right = zoomedToRadarX(grid.originX + grid.columns * grid.cellSize, z);
      const bottom = zoomedToRadarY(grid.originY - grid.rows * grid.cellSize, z);
      context.drawImage(layerCanvas.canvas, left, top, right - left, bottom - top);
    });

    context.restore();
  };

  return { drawBombDamage };
}
