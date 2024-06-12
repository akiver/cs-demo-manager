import { updatePlayersTags } from 'csdm/node/database/tags/update-players-tags';
import { handleError } from 'csdm/server/handlers/handle-error';

export type UpdatePlayersTagsPayload = {
  steamIds: string[];
  tagIds: string[];
};

export async function updatePlayersTagsHandler({ steamIds, tagIds }: UpdatePlayersTagsPayload) {
  try {
    await updatePlayersTags(steamIds, tagIds);
  } catch (error) {
    handleError(error, 'Error while updating players tags');
  }
}
