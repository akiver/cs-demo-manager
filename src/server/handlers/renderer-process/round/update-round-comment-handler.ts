import { insertOrUpdateRoundComment } from 'csdm/node/database/comments/insert-or-update-round-comment';
import { handleError } from '../../handle-error';

export type UpdateRoundCommentPayload = {
  checksum: string;
  number: number;
  comment: string;
};

export async function updateRoundCommentHandler({ checksum, number, comment }: UpdateRoundCommentPayload) {
  try {
    await insertOrUpdateRoundComment(checksum, number, comment);
  } catch (error) {
    handleError(error, `Error while updating round comment #${number} for match ${checksum}`);
  }
}
