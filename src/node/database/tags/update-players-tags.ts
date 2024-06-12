import { db } from 'csdm/node/database/database';
import { uniqueArray } from 'csdm/common/array/unique-array';
import type { SteamAccountTagRow } from './steam-account-tag-table';

export async function updatePlayersTags(steamIds: string[], tagIds: string[]) {
  const uniqueTagIds = uniqueArray(tagIds);
  if (uniqueTagIds.length === 0) {
    return;
  }

  const rows: SteamAccountTagRow[] = [];
  for (const steamId of steamIds) {
    for (const tagId of uniqueTagIds) {
      rows.push({
        steam_id: steamId,
        tag_id: tagId,
      });
    }
  }

  await db.transaction().execute(async (transaction) => {
    await transaction
      .deleteFrom('steam_account_tags')
      .where('steam_id', 'in', steamIds)
      .where('tag_id', 'not in', uniqueTagIds)
      .execute();

    await transaction
      .insertInto('steam_account_tags')
      .values(rows)
      .onConflict((oc) => {
        return oc.columns(['steam_id', 'tag_id']).doNothing();
      })
      .execute();
  });
}
