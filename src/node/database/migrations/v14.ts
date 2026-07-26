import type { Migration } from './migration';
import { Game } from 'csdm/common/types/counter-strike';

const v14: Migration = {
  schemaVersion: 14,
  run: async (transaction) => {
    await transaction
      .updateTable('maps')
      .set({
        position_x: -2000,
        position_y: 3250,
        scale: 5.5,
      })
      .where('name', '=', 'de_cache')
      .where('game', '=', Game.CS2)
      .execute();
  },
};

export default v14;
