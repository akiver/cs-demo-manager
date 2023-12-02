import { handleError } from '../../handle-error';
import { insertOrUpdatePlayerComment } from 'csdm/node/database/comments/insert-or-update-player-comment';

export type UpdatePlayerCommentPayload = {
  steamId: string;
  comment: string;
};

export async function updatePlayerCommentHandler({ steamId, comment }: UpdatePlayerCommentPayload) {
  try {
    await insertOrUpdatePlayerComment(steamId, comment);
  } catch (error) {
    handleError(error, `Error while updating player comment with steamID ${steamId}`);
  }
}
