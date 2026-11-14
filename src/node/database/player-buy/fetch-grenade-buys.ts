import { WeaponType } from 'csdm/common/types/counter-strike';
import type { GrenadeBuy } from 'csdm/common/types/grenade-buy';
import { db } from 'csdm/node/database/database';

export async function fetchGrenadeBuys(checksum: string) {
  const rows = await db
    .selectFrom('player_buys')
    .select(['player_steam_id', 'weapon_name', 'weapon_unique_id'])
    .where('match_checksum', '=', checksum)
    .where('weapon_type', '=', WeaponType.Grenade)
    .where('has_refunded', '=', false)
    .execute();

  const buys: GrenadeBuy[] = rows.map((row) => {
    return {
      playerSteamId: row.player_steam_id,
      weaponName: row.weapon_name,
      weaponUniqueId: row.weapon_unique_id,
    };
  });

  return buys;
}
