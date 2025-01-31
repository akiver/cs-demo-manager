import { deleteTag } from 'csdm/node/database/tags/delete-tag';
import { removeTagIdFromSettings } from 'csdm/node/settings/remove-tag-id-from-settings';
import { handleError } from '../../handle-error';

export async function deleteTagHandler(tagId: string) {
  try {
    await deleteTag(tagId);
    await removeTagIdFromSettings(tagId);
  } catch (error) {
    handleError(error, 'Error while deleting tag');
  }
}
