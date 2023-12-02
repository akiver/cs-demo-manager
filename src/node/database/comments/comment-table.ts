import type { Selectable } from 'kysely';

export type CommentTable = {
  checksum: string;
  comment: string;
};

export type CommentRow = Selectable<CommentTable>;
