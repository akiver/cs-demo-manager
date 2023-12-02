import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import type { Tag } from 'csdm/common/types/tag';
import { updateTag } from 'csdm/node/database/tags/update-tag';

export async function updateTagHandler(tag: Tag) {
  try {
    await updateTag(tag);
  } catch (error) {
    logger.error('Error while updating tag');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    throw errorCode;
  }
}
