import { db } from 'csdm/node/database/database';
import { getDatabaseErrorCode } from 'csdm/node/database/get-database-error-code';
import { PostgresqlErrorCode } from '../postgresql-error-code';
import { assertValidTag } from './assert-valid-tag';
import { TagNameAlreadyTaken } from './errors/tag-name-already-taken';
import type { Tag } from '../../../common/types/tag';

export async function updateTag(tag: Tag) {
  assertValidTag(tag);

  try {
    await db.updateTable('tags').set(tag).where('id', '=', tag.id).execute();
  } catch (error) {
    if (getDatabaseErrorCode(error) === PostgresqlErrorCode.UniqueViolation) {
      throw new TagNameAlreadyTaken();
    }
    throw error;
  }
}
