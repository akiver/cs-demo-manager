type Vector3 = { x: number; y: number; z: number };

export type MapBombDamageSite = {
  letter: 'A' | 'B';
  min: Vector3;
  max: Vector3;
  // Travel distance (in game units) at which the shockwave stops being lethal.
  lethalReach: number;
};

type MapBombDamageLayer = {
  level: 'upper' | 'lower';
  // Int16Array (base64) of columns * rows cells, the Z coordinate of the floor at each cell.
  floorZ: string;
  // One Uint16Array (base64) per site of columns * rows cells, the shockwave travel distance from the site.
  distances: string[];
};

export type MapBombDamage = {
  version: number;
  // SHA-256 of the baked_bomb_damage.vdata file used to generate the data, to know when it needs a refresh.
  sourceSha256: string;
  // Network protocol of the CS2 update that baked the shockwave data into the map for the first time.
  // Older demos of the map used the legacy radial model.
  // It's not updated when Valve only refreshes the data of a map that already had some, demos recorded before the
  // refresh are drawn with the latest data.
  minNetworkProtocol: number;
  grid: {
    // World coordinates of the top-left corner of the top-left cell.
    originX: number;
    originY: number;
    cellSize: number;
    columns: number;
    rows: number;
  };
  sites: MapBombDamageSite[];
  layers: MapBombDamageLayer[];
};
