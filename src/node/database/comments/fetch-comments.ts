import { db } from 'csdm/node/database/database';
import type { CommentRow } from './comment-table';

export async function fetchComments() {
  const rows: CommentRow[] = await db.selectFrom('comments').selectAll().execute();

  return rows;
}
