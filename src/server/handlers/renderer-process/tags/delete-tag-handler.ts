import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { deleteTag } from 'csdm/node/database/tags/delete-tag';
import { removeTagIdFromSettings } from 'csdm/node/settings/remove-tag-id-from-settings';

export async function deleteTagHandler(tagId: string) {
  try {
    await deleteTag(tagId);
    await removeTagIdFromSettings(tagId);
  } catch (error) {
    logger.error('Error while deleting tag');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    throw errorCode;
  }
}
