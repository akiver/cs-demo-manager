import { db } from '../database';

export async function deleteMatchPositions(checksum: string) {
  await db.transaction().execute(async (transaction) => {
    await transaction.deleteFrom('player_positions').where('match_checksum', '=', checksum).execute();
    await transaction.deleteFrom('grenade_positions').where('match_checksum', '=', checksum).execute();
    await transaction.deleteFrom('inferno_positions').where('match_checksum', '=', checksum).execute();
    await transaction.deleteFrom('hostage_positions').where('match_checksum', '=', checksum).execute();
    await transaction.deleteFrom('chicken_positions').where('match_checksum', '=', checksum).execute();
  });
}
