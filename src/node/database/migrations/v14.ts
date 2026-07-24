import type { Migration } from './migration';
import { Game } from 'csdm/common/types/counter-strike';

const v14: Migration = {
  schemaVersion: 14,
  run: async (transaction) => {
    await transaction
      .updateTable('maps')
      .set({
        position_x: -1953,
        position_y: 3094,
        scale: 2.644154,
      })
      .where('name', '=', 'de_cache')
      .where('game', '=', Game.CS2)
      .execute();
  },
};

export default v14;
