import { db } from './database';

export async function deletePositions() {
  await db.transaction().execute(async (transaction) => {
    await transaction.deleteFrom('player_positions').execute();
    await transaction.deleteFrom('grenade_positions').execute();
    await transaction.deleteFrom('inferno_positions').execute();
    await transaction.deleteFrom('hostage_positions').execute();
    await transaction.deleteFrom('chicken_positions').execute();
  });
}
