import { sql, type Transaction } from 'kysely';
import type { Database } from '../../schema';

export async function createCamerasTable(transaction: Transaction<Database>) {
  await transaction.schema
    .createTable('cameras')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col
        .primaryKey()
        .notNull()
        .defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('game', 'varchar', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('map_name', 'varchar', (col) => col.notNull())
    .addColumn('x', 'float8', (col) => col.notNull())
    .addColumn('y', 'float8', (col) => col.notNull())
    .addColumn('z', 'float8', (col) => col.notNull())
    .addColumn('pitch', 'float8', (col) => col.notNull())
    .addColumn('yaw', 'float8', (col) => col.notNull())
    .addColumn('comment', 'text', (col) => col.notNull().defaultTo(''))
    .addColumn('color', 'varchar', (col) => col.notNull())
    .addUniqueConstraint('cameras_game_name_map_unique', ['game', 'name', 'map_name'])
    .execute();
}
