import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import type { Tag } from 'csdm/common/types/tag';
import { insertTag } from 'csdm/node/database/tags/insert-tag';

export async function insertTagHandler(tag: Omit<Tag, 'id'>) {
  try {
    const newTag = await insertTag(tag);

    return newTag;
  } catch (error) {
    logger.error('Error while inserting tag');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    throw errorCode;
  }
}
