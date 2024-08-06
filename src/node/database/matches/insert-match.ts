import { deleteMatchesByChecksums } from './delete-matches-by-checksums';
import { getSettings } from 'csdm/node/settings/get-settings';
import type { ShotTable } from '../shots/shot-table';
import type { TeamTable } from '../teams/team-table';
import type { BombPlantedTable } from '../bomb-planted/bomb-planted-table';
import type { BombDefusedTable } from '../bomb-defused/bomb-defused-table';
import type { BombDefuseStartTable } from '../bomb-defuse-start/bomb-defuse-start-table';
import type { BombExplodedTable } from '../bomb-exploded/bomb-exploded-table';
import type { BombPlantStartTable } from '../bomb-plant-start/bomb-plant-start-table';
import type { MatchPlayerTable } from '../match-players/match-player-table';
import type { RoundTable } from '../rounds/round-table';
import type { DamageTable } from '../damages/damage-table';
import type { PlayerEconomyTable } from '../player-economies/player-economy-table';
import type { PlayerBuyTable } from '../player-buy/player-buy-table';
import type { ClutchTable } from '../clutches/clutch-table';
import type { PlayerBlindTable } from '../player-blinds/player-blind-table';
import type { KillTable } from '../kills/kill-table';
import type { GrenadeBounceTable } from '../grenade-bounce/grenade-bounce-table';
import type { GrenadeProjectileDestroyTable } from '../grenade-projectile-destroy/grenade-projectile-destroy-table';
import type { DecoyStartTable } from '../decoy-started/decoy-start-table';
import type { SmokeStartTable } from '../smoke-started/smoke-start-table';
import type { HeGrenadeExplodeTable } from '../he-grenade-exploded/he-grenade-explode-table';
import type { FlashbangExplodeTable } from '../flashbang-exploded/flashbang-explode-table';
import type { ChatMessageTable } from '../chat-messages/chat-message-table';
import type { HostageRescuedTable } from '../hostage-rescued/hostage-rescued-table';
import type { HostagePickUpStartTable } from '../hostage-pick-up-start/hostage-pick-up-start-table';
import type { HostagePickedUpTable } from '../hostage-picked-up/hostage-picked-up-table';
import type { ChickenDeathTable } from '../chicken-death/chicken-death-table';
import type { MatchTable } from './match-table';
import {
  deleteCsvFilesInOutputFolder,
  getCsvFilePath,
  getDemoNameFromPath,
  insertFromCsv,
  type InsertOptions,
} from './match-insertion';
import { insertMatchPositions } from './insert-match-positions';
import { InsertRoundsError } from './errors/insert-rounds-error';
import { DuplicatedMatchChecksum } from './errors/duplicated-match-checksum';

async function insertShots({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_shots.csv');

  await insertFromCsv<ShotTable>({
    databaseSettings,
    csvFilePath,
    tableName: 'shots',
    columns: [
      'frame',
      'tick',
      'round_number',
      'weapon_name',
      'weapon_id',
      'projectile_id',
      'x',
      'y',
      'z',
      'player_name',
      'player_steam_id',
      'player_team_name',
      'player_side',
      'is_player_controlling_bot',
      'player_yaw',
      'player_pitch',
      'player_velocity_x',
      'player_velocity_y',
      'player_velocity_z',
      'recoil_index',
      'aim_punch_angle_x',
      'aim_punch_angle_y',
      'view_punch_angle_x',
      'view_punch_angle_y',
      'match_checksum',
    ],
  });
}

async function insertTeamsFromCsv({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_teams.csv');

  await insertFromCsv<TeamTable>({
    databaseSettings,
    tableName: 'teams',
    csvFilePath,
    columns: ['name', 'letter', 'score', 'score_first_half', 'score_second_half', 'current_side', 'match_checksum'],
  });
}

async function insertBombsPlantedFromCsv({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_bombs_planted.csv');

  await insertFromCsv<BombPlantedTable>({
    databaseSettings,
    tableName: 'bombs_planted',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'site',
      'planter_steam_id',
      'planter_name',
      'is_planter_controlling_bot',
      'x',
      'y',
      'z',
      'match_checksum',
    ],
  });
}

async function insertBombsDefuseStartFromCsv({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_bombs_defuse_start.csv');

  await insertFromCsv<BombDefuseStartTable>({
    databaseSettings,
    tableName: 'bombs_defuse_start',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'defuser_steam_id',
      'defuser_name',
      'is_defuser_controlling_bot',
      'x',
      'y',
      'z',
      'match_checksum',
    ],
  });
}

async function insertBombsDefusedFromCsv({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_bombs_defused.csv');

  await insertFromCsv<BombDefusedTable>({
    databaseSettings,
    tableName: 'bombs_defused',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'site',
      'defuser_steam_id',
      'defuser_name',
      'is_defuser_controlling_bot',
      'x',
      'y',
      'z',
      'ct_alive_count',
      't_alive_count',
      'match_checksum',
    ],
  });
}

async function insertBombsExplodedFromCsv({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_bombs_exploded.csv');

  await insertFromCsv<BombExplodedTable>({
    databaseSettings,
    tableName: 'bombs_exploded',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'site',
      'planter_steam_id',
      'planter_name',
      'is_planter_controlling_bot',
      'x',
      'y',
      'z',
      'match_checksum',
    ],
  });
}

async function insertBombsPlantStartFromCsv({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_bombs_plant_start.csv');

  await insertFromCsv<BombPlantStartTable>({
    databaseSettings,
    tableName: 'bombs_plant_start',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'site',
      'planter_steam_id',
      'planter_name',
      'is_planter_controlling_bot',
      'x',
      'y',
      'z',
      'match_checksum',
    ],
  });
}

async function insertPlayers({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_players.csv');

  await insertFromCsv<MatchPlayerTable>({
    databaseSettings,
    tableName: 'players',
    csvFilePath,
    columns: [
      'name',
      'steam_id',
      'index',
      'score',
      'team_name',
      'kill_count',
      'assist_count',
      'death_count',
      'headshot_count',
      'kast',
      'average_damage_per_round',
      'average_kill_per_round',
      'average_death_per_round',
      'utility_damage_per_round',
      'mvp_count',
      'rank_type',
      'rank',
      'old_rank',
      'wins_count',
      'bomb_planted_count',
      'bomb_defused_count',
      'hostage_rescued_count',
      'damage_health',
      'damage_armor',
      'utility_damage',
      'first_kill_count',
      'first_death_count',
      'trade_kill_count',
      'trade_death_count',
      'first_trade_kill_count',
      'first_trade_death_count',
      'one_kill_count',
      'two_kill_count',
      'three_kill_count',
      'four_kill_count',
      'five_kill_count',
      'hltv_rating_2',
      'hltv_rating',
      'crosshair_share_code',
      'color',
      'inspect_weapon_count',
      'match_checksum',
    ],
  });
}

async function insertRounds({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  try {
    const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_rounds.csv');

    await insertFromCsv<RoundTable>({
      databaseSettings,
      tableName: 'rounds',
      csvFilePath,
      columns: [
        'number',
        'start_tick',
        'start_frame',
        'freeze_time_end_tick',
        'freeze_time_end_frame',
        'end_tick',
        'end_frame',
        'end_officially_tick',
        'end_officially_frame',
        'team_a_name',
        'team_b_name',
        'team_a_score',
        'team_b_score',
        'team_a_side',
        'team_b_side',
        'team_a_start_money',
        'team_b_start_money',
        'team_a_equipment_value',
        'team_b_equipment_value',
        'team_a_money_spent',
        'team_b_money_spent',
        'team_a_economy_type',
        'team_b_economy_type',
        'duration',
        'end_reason',
        'winner_name',
        'winner_side',
        'overtime_number',
        'match_checksum',
      ],
    });
  } catch (error) {
    throw new InsertRoundsError(error);
  }
}

async function insertDamages({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_damages.csv');

  await insertFromCsv<DamageTable>({
    databaseSettings,
    tableName: 'damages',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'health_damage',
      'armor_damage',
      'victim_health',
      'victim_new_health',
      'victim_armor',
      'victim_new_armor',
      'attacker_steam_id',
      'attacker_side',
      'attacker_team_name',
      'is_attacker_controlling_bot',
      'victim_steam_id',
      'victim_side',
      'victim_team_name',
      'is_victim_controlling_bot',
      'weapon_name',
      'weapon_type',
      'hitgroup',
      'weapon_unique_id',
      'match_checksum',
    ],
  });
}

async function insertPlayersEconomies({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_players_economy.csv');

  await insertFromCsv<PlayerEconomyTable>({
    databaseSettings,
    tableName: 'player_economies',
    csvFilePath,
    columns: [
      'player_steam_id',
      'player_name',
      'player_side',
      'start_money',
      'money_spent',
      'equipment_value',
      'type',
      'round_number',
      'match_checksum',
    ],
  });
}

async function insertPlayersBuy({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_players_buy.csv');

  await insertFromCsv<PlayerBuyTable>({
    databaseSettings,
    tableName: 'player_buys',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'player_steam_id',
      'player_side',
      'player_name',
      'weapon_name',
      'weapon_type',
      'weapon_unique_id',
      'has_refunded',
      'match_checksum',
    ],
  });
}

async function insertClutchesFromCsv({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_clutches.csv');

  await insertFromCsv<ClutchTable>({
    databaseSettings,
    tableName: 'clutches',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'opponent_count',
      'side',
      'won',
      'clutcher_steam_id',
      'clutcher_name',
      'has_clutcher_survived',
      'clutcher_kill_count',
      'match_checksum',
    ],
  });
}

async function insertPlayersFlashedFromCsv({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_players_flashed.csv');

  await insertFromCsv<PlayerBlindTable>({
    databaseSettings,
    tableName: 'player_blinds',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'duration',
      'flashed_steam_id',
      'flashed_name',
      'flashed_side',
      'is_flashed_controlling_bot',
      'flasher_steam_id',
      'flasher_name',
      'flasher_side',
      'is_flasher_controlling_bot',
      'match_checksum',
    ],
  });
}

async function insertKillsFromCsv({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_kills.csv');

  await insertFromCsv<KillTable>({
    databaseSettings,
    tableName: 'kills',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'killer_name',
      'killer_steam_id',
      'killer_side',
      'killer_team_name',
      'victim_name',
      'victim_steam_id',
      'victim_side',
      'victim_team_name',
      'assister_name',
      'assister_steam_id',
      'assister_side',
      'assister_team_name',
      'weapon_name',
      'weapon_type',
      'is_headshot',
      'penetrated_objects',
      'is_assisted_flash',
      'is_killer_controlling_bot',
      'is_victim_controlling_bot',
      'is_assister_controlling_bot',
      'killer_x',
      'killer_y',
      'killer_z',
      'is_killer_airborne',
      'is_killer_blinded',
      'victim_x',
      'victim_y',
      'victim_z',
      'is_victim_airborne',
      'is_victim_blinded',
      'is_victim_inspecting_weapon',
      'assister_x',
      'assister_y',
      'assister_z',
      'is_trade_kill',
      'is_trade_death',
      'is_through_smoke',
      'is_no_scope',
      'distance',
      'match_checksum',
    ],
  });
}

async function insertGrenadeBounces({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_grenade_bounces.csv');

  await insertFromCsv<GrenadeBounceTable>({
    databaseSettings,
    tableName: 'grenade_bounces',
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

async function insertGrenadeProjectilesDestroy({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_grenade_projectiles_destroy.csv');

  await insertFromCsv<GrenadeProjectileDestroyTable>({
    databaseSettings,
    tableName: 'grenade_projectiles_destroy',
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

async function insertDecoysStart({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_decoys_start.csv');

  await insertFromCsv<DecoyStartTable>({
    databaseSettings,
    tableName: 'decoys_start',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'grenade_id',
      'projectile_id',
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

async function insertSmokesStart({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_smokes_start.csv');

  await insertFromCsv<SmokeStartTable>({
    databaseSettings,
    tableName: 'smokes_start',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'grenade_id',
      'projectile_id',
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

async function insertHeGrenadesExplode({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_he_grenades_explode.csv');

  await insertFromCsv<HeGrenadeExplodeTable>({
    databaseSettings,
    tableName: 'he_grenades_explode',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'grenade_id',
      'projectile_id',
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

async function insertFlashbangsExplode({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_flashbangs_explode.csv');

  await insertFromCsv<FlashbangExplodeTable>({
    databaseSettings,
    tableName: 'flashbangs_explode',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'grenade_id',
      'projectile_id',
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

async function insertChatMessages({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_chat_messages.csv');

  await insertFromCsv<ChatMessageTable>({
    databaseSettings,
    tableName: 'chat_messages',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'sender_steam_id',
      'sender_name',
      'message',
      'sender_is_alive',
      'sender_side',
      'match_checksum',
    ],
  });
}

async function insertHostageRescued({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_hostage_rescued.csv');

  await insertFromCsv<HostageRescuedTable>({
    databaseSettings,
    tableName: 'hostage_rescued',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'player_steam_id',
      'is_player_controlling_bot',
      'hostage_entity_id',
      'x',
      'y',
      'z',
      'match_checksum',
    ],
  });
}

async function insertHostagePickUpStart({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_hostage_pick_up_start.csv');

  await insertFromCsv<HostagePickUpStartTable>({
    databaseSettings,
    tableName: 'hostage_pick_up_start',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'player_steam_id',
      'is_player_controlling_bot',
      'hostage_entity_id',
      'x',
      'y',
      'z',
      'match_checksum',
    ],
  });
}

async function insertHostagePickedUp({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_hostage_picked_up.csv');

  await insertFromCsv<HostagePickedUpTable>({
    databaseSettings,
    tableName: 'hostage_picked_up',
    csvFilePath,
    columns: [
      'frame',
      'tick',
      'round_number',
      'player_steam_id',
      'is_player_controlling_bot',
      'hostage_entity_id',
      'x',
      'y',
      'z',
      'match_checksum',
    ],
  });
}

async function insertChickenDeaths({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_chicken_deaths.csv');

  await insertFromCsv<ChickenDeathTable>({
    databaseSettings,
    tableName: 'chicken_deaths',
    csvFilePath,
    columns: ['frame', 'tick', 'round_number', 'killer_steam_id', 'weapon_name', 'match_checksum'],
  });
}

async function insertMatchFromCsv({ outputFolderPath, demoName, databaseSettings }: InsertOptions) {
  try {
    const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_match.csv');

    await insertFromCsv<MatchTable>({
      databaseSettings,
      tableName: 'matches',
      csvFilePath,
      columns: [
        'checksum',
        'game',
        'demo_path',
        'name',
        'date',
        'source',
        'type',
        'share_code',
        'map_name',
        'server_name',
        'client_name',
        'tick_count',
        'tickrate',
        'framerate',
        'duration',
        'network_protocol',
        'build_number',
        'game_type',
        'game_mode',
        'game_mode_str',
        'is_ranked',
        'kill_count',
        'assist_count',
        'death_count',
        'shot_count',
        'winner_name',
        'winner_side',
        'overtime_count',
        'max_rounds',
        'has_vac_live_ban',
      ],
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('matches_pkey')) {
      throw new DuplicatedMatchChecksum(error);
    }

    throw error;
  }
}

export type InsertMatchParameters = {
  checksum: string;
  demoPath: string;
  // Folder path where CSV files generated by cs-demo-analyzer on the host machine are located.
  outputFolderPath: string;
};

/**
 * Matches are inserted into the database from CSV files generated by the demo analyzer CLI.
 * The reason is that inserting data from CSV files is much faster than SQL INSERT statements.
 * A 64 tick demo generates around 600K rows containing players position, it takes only ~6s to insert it from a CSV file.
 *
 * CSVs are inserted using the psql "\copy" command, thus the CLI must be installed on the host machine.
 * It could be possible to insert CSV files from the server side using the "COPY FROM" statement, but in case of a
 * remote database it would require to upload those files.
 */
export async function insertMatch({ checksum, demoPath, outputFolderPath }: InsertMatchParameters) {
  try {
    const settings = await getSettings();
    const { database: databaseSettings } = settings;
    await deleteMatchesByChecksums([checksum]);

    const demoName = getDemoNameFromPath(demoPath);
    await insertMatchFromCsv({
      databaseSettings,
      outputFolderPath,
      demoName,
    });

    await Promise.all([
      insertTeamsFromCsv({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertRounds({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertPlayers({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertKillsFromCsv({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertBombsPlantedFromCsv({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertBombsDefusedFromCsv({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertBombsExplodedFromCsv({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertBombsDefuseStartFromCsv({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertBombsPlantStartFromCsv({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertClutchesFromCsv({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertPlayersFlashedFromCsv({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertPlayersEconomies({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertShots({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertDamages({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertPlayersBuy({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertHostageRescued({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertHostagePickUpStart({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertHostagePickedUp({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertChickenDeaths({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertHeGrenadesExplode({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertSmokesStart({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertDecoysStart({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertFlashbangsExplode({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertGrenadeBounces({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertGrenadeProjectilesDestroy({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertChatMessages({
        databaseSettings,
        outputFolderPath,
        demoName,
      }),
      insertMatchPositions({
        demoName,
        databaseSettings,
        outputFolderPath,
      }),
    ]);
  } catch (error) {
    // It's not possible to use a transaction since data are inserted with the psql CLI.
    // Mimic a rollback in case of error by deleting the match we were trying to insert.
    await deleteMatchesByChecksums([checksum]);
    throw error;
  } finally {
    await deleteCsvFilesInOutputFolder(outputFolderPath);
  }
}
