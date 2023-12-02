import type { Damage } from 'csdm/common/types/damage';
import type { DamageRow } from './damage-table';

export function damageRowToDamage(row: DamageRow): Damage {
  return {
    id: row.id,
    matchChecksum: row.match_checksum,
    tick: row.tick,
    frame: row.frame,
    roundNumber: row.round_number,
    armorDamage: row.armor_damage,
    healthDamage: row.health_damage,
    attackerSteamId: row.attacker_steam_id,
    attackerSide: row.attacker_side,
    attackerTeamName: row.attacker_team_name,
    isAttackerControllingBot: row.is_attacker_controlling_bot,
    victimSteamId: row.victim_steam_id,
    victimSide: row.victim_side,
    victimTeamName: row.victim_team_name,
    victimArmor: row.victim_armor,
    victimNewArmor: row.victim_new_armor,
    victimHealth: row.victim_health,
    victimNewHealth: row.victim_new_health,
    isVictimControllingBot: row.is_victim_controlling_bot,
    weaponName: row.weapon_name,
    weaponType: row.weapon_type,
    hitgroup: row.hitgroup,
    weaponUniqueId: row.weapon_unique_id,
  };
}
