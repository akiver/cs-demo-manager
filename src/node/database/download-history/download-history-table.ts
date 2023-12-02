import type { Generated } from 'kysely';

// Used to avoid auto downloading several times demos that have been downloaded from the app but then moved or deleted
// from the user's download folder.
export type DownloadHistoryTable = {
  match_id: string;
  downloaded_at: Generated<Date>;
};
