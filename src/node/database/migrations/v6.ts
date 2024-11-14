import { Game } from 'csdm/common/types/counter-strike';
import { insertDefaultMaps } from '../maps/insert-default-maps';
import type { Migration } from './migration';

const v6: Migration = {
  schemaVersion: 6,
  run: async (transaction) => {
    await insertDefaultMaps(transaction);

    await transaction
      .updateTable('maps')
      .set({
        position_x: -2308,
        position_y: 2078,
        scale: 4.082077,
      })
      .where('name', '=', 'de_train')
      .where('game', '=', Game.CS2)
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v6;
