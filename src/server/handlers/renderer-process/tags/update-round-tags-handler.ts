import { handleError } from 'csdm/server/handlers/handle-error';
import { updateRoundTags } from 'csdm/node/database/tags/update-round-tags';

export type UpdateRoundTagsPayload = {
  checksum: string;
  roundNumber: number;
  tagIds: string[];
};

export async function updateRoundTagsHandler({ checksum, roundNumber, tagIds }: UpdateRoundTagsPayload) {
  try {
    await updateRoundTags(checksum, roundNumber, tagIds);
  } catch (error) {
    handleError(error, 'Error while updating round tags');
  }
}
