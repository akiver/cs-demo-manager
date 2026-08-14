import { db } from 'csdm/node/database/database';
import { getDatabaseErrorCode } from 'csdm/node/database/get-database-error-code';
import { PostgresqlErrorCode } from '../postgresql-error-code';
import { assertValidTag } from './assert-valid-tag';
import { TagNameAlreadyTaken } from './errors/tag-name-already-taken';
import { tagRowToTag } from './tag-row-to-tag';
import type { InsertableTag } from './tag-table';

export async function insertTag(tag: InsertableTag) {
  assertValidTag(tag);

  try {
    const rows = await db.insertInto('tags').values(tag).returningAll().execute();
    const newTag = tagRowToTag(rows[0]);

    return newTag;
  } catch (error) {
    if (getDatabaseErrorCode(error) === PostgresqlErrorCode.UniqueViolation) {
      throw new TagNameAlreadyTaken();
    }
    throw error;
  }
}
