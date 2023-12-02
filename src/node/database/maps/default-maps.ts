import { Game } from 'csdm/common/types/counter-strike';
import type { InsertableMap } from './map-table';

export function getDefaultMaps(game?: Game) {
  const csgoMaps: InsertableMap[] = [
    {
      name: 'cs_assault',
      game: Game.CSGO,
      position_x: 4041,
      position_y: 7838,
      scale: 4.6,
    },
    {
      name: 'cs_italy',
      game: Game.CSGO,
      position_x: -2647,
      position_y: 2592,
      scale: 4.6,
    },
    {
      name: 'cs_militia',
      game: Game.CSGO,
      position_x: -1474,
      position_y: 2296,
      scale: 4.5,
    },
    {
      name: 'cs_office',
      game: Game.CSGO,
      position_x: -1838,
      position_y: 1858,
      scale: 4.1,
    },
    {
      name: 'de_ancient',
      game: Game.CSGO,
      position_x: -2953,
      position_y: 2164,
      scale: 5,
    },
    {
      name: 'de_anubis',
      game: Game.CSGO,
      position_x: -2796,
      position_y: 3328,
      scale: 5.22,
    },
    {
      name: 'de_aztec',
      game: Game.CSGO,
      position_x: -3200,
      position_y: 2841,
      scale: 6,
    },
    {
      name: 'de_cache',
      game: Game.CSGO,
      position_x: -2000,
      position_y: 3250,
      scale: 5.5,
    },
    {
      name: 'de_canals',
      game: Game.CSGO,
      position_x: -2496,
      position_y: 1792,
      scale: 4,
    },
    {
      name: 'de_cbble',
      game: Game.CSGO,
      position_x: -3840,
      position_y: 3072,
      scale: 6,
    },
    {
      name: 'de_dust',
      game: Game.CSGO,
      position_x: -2850,
      position_y: 4073,
      scale: 6,
    },
    {
      name: 'de_dust2',
      game: Game.CSGO,
      position_x: -2476,
      position_y: 3239,
      scale: 4.4,
    },
    {
      name: 'de_inferno',
      game: Game.CSGO,
      position_x: -2087,
      position_y: 3870,
      scale: 4.9,
    },
    {
      name: 'de_mirage',
      game: Game.CSGO,
      position_x: -3230,
      position_y: 1713,
      scale: 5,
    },
    {
      name: 'de_nuke',
      game: Game.CSGO,
      position_x: -3453,
      position_y: 2887,
      scale: 7,
    },
    {
      name: 'de_overpass',
      game: Game.CSGO,
      position_x: -4831,
      position_y: 1781,
      scale: 5.2,
    },
    {
      name: 'de_train',
      game: Game.CSGO,
      position_x: -2477,
      position_y: 2392,
      scale: 4.7,
    },
    {
      name: 'de_vertigo',
      game: Game.CSGO,
      position_x: -3168,
      position_y: 1762,
      scale: 4,
    },
  ];

  const cs2Maps: InsertableMap[] = [
    {
      name: 'cs_assault',
      game: Game.CS2,
      position_x: 4041,
      position_y: 7838,
      scale: 4.6,
    },
    {
      name: 'cs_italy',
      game: Game.CS2,
      position_x: -2647,
      position_y: 2592,
      scale: 4.6,
    },
    {
      name: 'cs_militia',
      game: Game.CS2,
      position_x: -1474,
      position_y: 2296,
      scale: 4.5,
    },
    {
      name: 'cs_office',
      game: Game.CS2,
      position_x: -1838,
      position_y: 1858,
      scale: 4.1,
    },
    {
      name: 'de_ancient',
      game: Game.CS2,
      position_x: -2953,
      position_y: 2164,
      scale: 5,
    },
    {
      name: 'de_anubis',
      game: Game.CS2,
      position_x: -2796,
      position_y: 3328,
      scale: 5.22,
    },
    {
      name: 'de_aztec',
      game: Game.CS2,
      position_x: -3200,
      position_y: 2841,
      scale: 6,
    },
    {
      name: 'de_cache',
      game: Game.CS2,
      position_x: -2000,
      position_y: 3250,
      scale: 5.5,
    },
    {
      name: 'de_canals',
      game: Game.CS2,
      position_x: -2496,
      position_y: 1792,
      scale: 4,
    },
    {
      name: 'de_cbble',
      game: Game.CS2,
      position_x: -3840,
      position_y: 3072,
      scale: 6,
    },
    {
      name: 'de_dust',
      game: Game.CS2,
      position_x: -2850,
      position_y: 4073,
      scale: 6,
    },
    {
      name: 'de_dust2',
      game: Game.CS2,
      position_x: -2476,
      position_y: 3239,
      scale: 4.4,
    },
    {
      name: 'de_inferno',
      game: Game.CS2,
      position_x: -2087,
      position_y: 3870,
      scale: 4.9,
    },
    {
      name: 'de_mirage',
      game: Game.CS2,
      position_x: -3230,
      position_y: 1713,
      scale: 5,
    },
    {
      name: 'de_nuke',
      game: Game.CS2,
      position_x: -3453,
      position_y: 2887,
      scale: 7,
    },
    {
      name: 'de_overpass',
      game: Game.CS2,
      position_x: -4831,
      position_y: 1781,
      scale: 5.2,
    },
    {
      name: 'de_train',
      game: Game.CS2,
      position_x: -2477,
      position_y: 2392,
      scale: 4.7,
    },
    {
      name: 'de_vertigo',
      game: Game.CS2,
      position_x: -3168,
      position_y: 1762,
      scale: 4,
    },
  ];

  switch (game) {
    case Game.CSGO:
      return csgoMaps;
    case Game.CS2:
      return cs2Maps;
    default:
      return [...csgoMaps, ...cs2Maps];
  }
}
