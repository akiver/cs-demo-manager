import type { Transaction } from 'kysely';
import type { Database } from '../schema';
import { getDefaultMaps } from './default-maps';

export async function insertDefaultMaps(transaction: Transaction<Database>) {
  await transaction
    .insertInto('maps')
    .values(getDefaultMaps())
    .onConflict((oc) => oc.constraint('maps_name_game_unique').doNothing())
    .execute();
}
