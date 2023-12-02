import { updateChecksumsTags } from 'csdm/node/database/tags/update-checksums-tags';
import { handleError } from '../../handle-error';

export type UpdateChecksumsTagsPayload = {
  checksums: string[];
  tagIds: string[];
};

export async function updateChecksumsTagsHandler({ checksums, tagIds }: UpdateChecksumsTagsPayload) {
  try {
    await updateChecksumsTags(checksums, tagIds);
  } catch (error) {
    handleError(error, 'Error while updating checksums tags');
  }
}
