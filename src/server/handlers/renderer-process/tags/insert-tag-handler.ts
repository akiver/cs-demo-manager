import type { Tag } from 'csdm/common/types/tag';
import { insertTag } from 'csdm/node/database/tags/insert-tag';
import { handleError } from '../../handle-error';

export async function insertTagHandler(tag: Omit<Tag, 'id'>) {
  try {
    const newTag = await insertTag(tag);

    return newTag;
  } catch (error) {
    handleError(error, 'Error while inserting tag');
  }
}
