import type { Migration } from './migration';
import { Game } from 'csdm/common/types/counter-strike';

const v16: Migration = {
  schemaVersion: 16,
  run: async (transaction) => {
    await transaction
      .updateTable('maps')
      .set({
        position_x: -3615,
        position_y: 2712,
        scale: 4.724792,
      })
      .where('name', '=', 'de_cbble')
      .where('game', '=', Game.CS2)
      .execute();
  },
};

export default v16;
