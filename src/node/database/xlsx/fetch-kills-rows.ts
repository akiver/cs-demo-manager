import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';

export type KillRow = {
  matchChecksum: string;
  roundNumber: number;
  tick: number;
  frame: number;
  killerSteamId: string;
  killerName: string;
  killerSide: TeamNumber;
  victimSteamId: string;
  victimName: string;
  victimSide: TeamNumber;
  assisterSteamId: string;
  assisterName: string | null;
  assisterSide: TeamNumber;
  weaponName: string;
  isHeadshot: boolean;
  isAssistedFlash: boolean;
  isTradeKill: boolean;
  isTradeDeath: boolean;
  isThroughSmoke: boolean;
  isKillerAirborne: boolean;
  isVictimAirborne: boolean;
  isKillerBlinded: boolean;
  isVictimBlinded: boolean;
  isNoScope: boolean;
  distance: number;
  penetratedObjects: number;
  killerX: number;
  killerY: number;
  killerZ: number;
  victimX: number;
  victimY: number;
  victimZ: number;
  assisterX: number;
  assisterY: number;
  assisterZ: number;
  isKillerControllingBot: boolean;
  isVictimControllingBot: boolean;
  isAssisterControllingBot: boolean;
};

export async function fetchKillsRows(checksums: string[]) {
  const rows = await db
    .selectFrom('kills')
    .select([
      'match_checksum as matchChecksum',
      'round_number as roundNumber',
      'tick',
      'frame',
      'killer_steam_id as killerSteamId',
      'killer_name as killerName',
      'killer_side as killerSide',
      'victim_steam_id as victimSteamId',
      'victim_name as victimName',
      'victim_side as victimSide',
      'assister_steam_id as assisterSteamId',
      'assister_name as assisterName',
      'assister_side as assisterSide',
      'weapon_name as weaponName',
      'is_headshot as isHeadshot',
      'is_assisted_flash as isAssistedFlash',
      'is_trade_kill as isTradeKill',
      'is_trade_death as isTradeDeath',
      'is_no_scope as isNoScope',
      'is_through_smoke as isThroughSmoke',
      'is_killer_airborne as isKillerAirborne',
      'is_victim_airborne as isVictimAirborne',
      'is_killer_blinded as isKillerBlinded',
      'is_victim_blinded as isVictimBlinded',
      'distance',
      'penetrated_objects as penetratedObjects',
      'killer_x as killerX',
      'killer_y as killerY',
      'killer_z as killerZ',
      'victim_x as victimX',
      'victim_y as victimY',
      'victim_z as victimZ',
      'assister_x as assisterX',
      'assister_y as assisterY',
      'assister_z as assisterZ',
      'is_killer_controlling_bot as isKillerControllingBot',
      'is_victim_controlling_bot as isVictimControllingBot',
      'is_assister_controlling_bot as isAssisterControllingBot',
    ])
    .where('match_checksum', 'in', checksums)
    .execute();

  return rows;
}
