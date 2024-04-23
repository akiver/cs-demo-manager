import {
  importDataFromV2Backup,
  type ImportV2BackupOptions,
} from 'csdm/node/database/database/import-data-from-v2-backup';
import { handleError } from 'csdm/server/handlers/handle-error';

export async function importDataFromV2BackupHandler(options: ImportV2BackupOptions) {
  try {
    return await importDataFromV2Backup(options);
  } catch (error) {
    handleError(error, 'Error while importing data from V2 backup');
  }
}
