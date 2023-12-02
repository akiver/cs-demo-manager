import { insertOrUpdateComment } from 'csdm/node/database/comments/insert-or-update-comment';
import { handleError } from '../../handle-error';

export type UpdateCommentPayload = {
  checksum: string;
  comment: string;
};

export async function updateCommentHandler({ checksum, comment }: UpdateCommentPayload) {
  try {
    await insertOrUpdateComment(checksum, comment);
  } catch (error) {
    handleError(error, `Error while updating comment with checksum ${checksum}`);
  }
}
