import type { MapBombDamage, MapBombDamageSite } from 'csdm/common/types/map-bomb-damage';

export type DecodedMapBombDamageLayer = {
  level: 'upper' | 'lower';
  floorZ: Int16Array;
  distances: Uint16Array[];
};

export type DecodedMapBombDamage = {
  grid: MapBombDamage['grid'];
  sites: MapBombDamageSite[];
  layers: DecodedMapBombDamageLayer[];
};

function base64ToBytes(base64: string) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

export function decodeMapBombDamage(data: MapBombDamage): DecodedMapBombDamage {
  return {
    grid: data.grid,
    sites: data.sites,
    layers: data.layers.map((layer) => {
      const floorZBytes = base64ToBytes(layer.floorZ);

      return {
        level: layer.level,
        floorZ: new Int16Array(floorZBytes.buffer, 0, floorZBytes.byteLength / 2),
        distances: layer.distances.map((distances) => {
          const bytes = base64ToBytes(distances);
          return new Uint16Array(bytes.buffer, 0, bytes.byteLength / 2);
        }),
      };
    }),
  };
}
