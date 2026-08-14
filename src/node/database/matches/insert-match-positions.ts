import type { PlayerPositionTable } from '../player-position/player-position-table';
import type { GrenadePositionTable } from '../grenade-position/grenade-position-table';
import type { InfernoPositionTable } from '../inferno-position/inferno-position-table';
import type { HostagePositionTable } from '../hostage-position/hostage-position-table';
import type { ChickenPositionTable } from '../chicken-position/chicken-position-table';
import { getCsvFilePath, type InsertOptions } from './match-insertion';
import { copyCsvIntoTable } from 'csdm/node/database/copy-csv-into-table';

async function insertPlayersPositions({ outputFolderPath, demoName }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_positions.csv');

  await copyCsvIntoTable<PlayerPositionTable>({
    csvFilePath,
    tableName: 'player_positions',
    columns: [
      'frame',
      'tick',
      'is_alive',
      'x',
      'y',
      'z',
      'yaw',
      'flash_duration_remaining',
      'side',
      'money',
      'health',
      'armor',
      'has_helmet',
      'has_bomb',
      'has_defuse_kit',
      'is_ducking',
      'is_airborne',
      'is_scoping',
      'is_defusing',
      'is_planting',
      'is_grabbing_hostage',
      'active_weapon_name',
      'equipments',
      'grenades',
      'pistols',
      'smgs',
      'rifles',
      'heavy',
      'player_steam_id',
      'player_name',
      'round_number',
      'match_checksum',
    ],
  });
}

async function insertGrenadePositions({ outputFolderPath, demoName }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_grenade_positions.csv');

  await copyCsvIntoTable<GrenadePositionTable>({
    tableName: 'grenade_positions',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'grenade_id',
      'projectile_id',
      'grenade_name',
      'x',
      'y',
      'z',
      'thrower_steam_id',
      'thrower_name',
      'thrower_side',
      'thrower_team_name',
      'thrower_velocity_x',
      'thrower_velocity_y',
      'thrower_velocity_z',
      'thrower_yaw',
      'thrower_pitch',
      'match_checksum',
    ],
  });
}

async function insertInfernoPositions({ outputFolderPath, demoName }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_inferno_positions.csv');

  await copyCsvIntoTable<InfernoPositionTable>({
    tableName: 'inferno_positions',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'thrower_steam_id',
      'thrower_name',
      'unique_id',
      'x',
      'y',
      'z',
      'convex_hull_2d',
      'match_checksum',
    ],
  });
}

async function insertHostagePositions({ outputFolderPath, demoName }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_hostage_positions.csv');

  await copyCsvIntoTable<HostagePositionTable>({
    tableName: 'hostage_positions',
    csvFilePath,
    columns: ['frame', 'tick', 'round_number', 'x', 'y', 'z', 'state', 'match_checksum'],
  });
}

async function insertChickenPositions({ outputFolderPath, demoName }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_chicken_positions.csv');

  await copyCsvIntoTable<ChickenPositionTable>({
    tableName: 'chicken_positions',
    csvFilePath,
    columns: ['frame', 'tick', 'round_number', 'x', 'y', 'z', 'match_checksum'],
  });
}

type InsertMatchPositionsParameters = {
  demoName: string;
  outputFolderPath: string;
};

export async function insertMatchPositions({ demoName, outputFolderPath }: InsertMatchPositionsParameters) {
  await Promise.all([
    insertPlayersPositions({
      outputFolderPath,
      demoName,
    }),
    insertGrenadePositions({
      outputFolderPath,
      demoName,
    }),
    insertInfernoPositions({
      outputFolderPath,
      demoName,
    }),
    insertHostagePositions({
      outputFolderPath,
      demoName,
    }),
    insertChickenPositions({
      outputFolderPath,
      demoName,
    }),
  ]);
}
