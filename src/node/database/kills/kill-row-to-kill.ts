import type { Kill } from 'csdm/common/types/kill';
import type { KillRow } from './kill-table';

export function killRowToKill(row: KillRow): Kill {
  return {
    id: row.id,
    matchChecksum: row.match_checksum,
    roundNumber: row.round_number,
    tick: row.tick,
    frame: row.frame,
    weaponName: row.weapon_name,
    weaponType: row.weapon_type,
    isHeadshot: row.is_headshot,
    killerName: row.killer_name,
    killerSide: row.killer_side,
    killerTeamName: row.killer_team_name || '',
    killerSteamId: row.killer_steam_id,
    killerX: row.killer_x,
    killerY: row.killer_y,
    killerZ: row.killer_z,
    victimName: row.victim_name,
    victimSide: row.victim_side,
    victimTeamName: row.victim_team_name || '',
    victimSteamId: row.victim_steam_id,
    victimX: row.victim_x,
    victimY: row.victim_y,
    victimZ: row.victim_z,
    assisterName: row.assister_name || '',
    assisterSide: row.assister_side,
    assisterSteamId: row.assister_steam_id,
    assisterTeamName: row.assister_team_name || '',
    assisterX: row.assister_x,
    assisterY: row.assister_y,
    assisterZ: row.assister_z,
    isKillerControllingBot: row.is_killer_controlling_bot,
    isKillerAirborne: row.is_killer_airborne,
    isKillerBlinded: row.is_killer_blinded,
    isVictimControllingBot: row.is_victim_controlling_bot,
    isVictimAirborne: row.is_victim_airborne,
    isAssisterControllingBot: row.is_assister_controlling_bot,
    isVictimBlinded: row.is_victim_blinded,
    isAssistedFlash: row.is_assisted_flash,
    isTradeDeath: row.is_trade_death,
    isTradeKill: row.is_trade_kill,
    penetratedObjects: row.penetrated_objects,
    isThroughSmoke: row.is_through_smoke,
    isNoScope: row.is_no_scope,
    distance: row.distance,
  };
}
