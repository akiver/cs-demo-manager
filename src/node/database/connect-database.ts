import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { openDatabase } from 'csdm/node/database/open-database';
import { startBackgroundTasks } from 'csdm/server/start-background-tasks';

export async function connectDatabase(databaseSettings?: DatabaseSettings) {
  await openDatabase(databaseSettings);
  void startBackgroundTasks();
}
