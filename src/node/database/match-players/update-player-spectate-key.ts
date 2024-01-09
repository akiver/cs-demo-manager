import { db } from 'csdm/node/database/database';

export async function updatePlayerSpectateKey(playerId: string, key: number) {
  await db
    .updateTable('players')
    .set({
      index: key,
    })
    .where('id', '=', playerId)
    .execute();
}
