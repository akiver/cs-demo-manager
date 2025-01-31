import type { Tag } from 'csdm/common/types/tag';
import { updateTag } from 'csdm/node/database/tags/update-tag';
import { handleError } from '../../handle-error';

export async function updateTagHandler(tag: Tag) {
  try {
    await updateTag(tag);
  } catch (error) {
    handleError(error, 'Error while updating tag');
  }
}
