import type { Migration } from './migration';

const v17: Migration = {
  schemaVersion: 17,
  run: async (transaction) => {
    // The CS2 scoreboard counts an enemy as flashed only if they were facing the flashbang.
    // Blinds from demos analyzed before this column existed keep being counted.
    await transaction.schema
      .alterTable('player_blinds')
      .addColumn('is_flashed_facing_flashbang', 'boolean', (col) => col.notNull().defaultTo(true))
      .execute();
  },
};

export default v17;
