import { getDefaultMaps } from '../maps/default-maps';
import type { Migration } from './migration';

const v5: Migration = {
  schemaVersion: 5,
  run: async (transaction) => {
    await transaction
      .insertInto('maps')
      .values(getDefaultMaps())
      .onConflict((oc) => oc.constraint('maps_name_game_unique').doNothing())
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v5;
