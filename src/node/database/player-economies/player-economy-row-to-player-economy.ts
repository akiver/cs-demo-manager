import type { PlayerEconomy } from 'csdm/common/types/player-economy';
import type { PlayerEconomyRow } from './player-economy-table';

export function playerEconomyRowToPlayerEconomy(row: PlayerEconomyRow): PlayerEconomy {
  return {
    id: row.id,
    matchChecksum: row.match_checksum,
    roundNumber: row.round_number,
    playerSteamId: row.player_steam_id,
    playerSide: row.player_side,
    equipmentValue: row.equipment_value,
    moneySpent: row.money_spent,
    playerName: row.player_name,
    startMoney: row.start_money,
    type: row.type,
  };
}
