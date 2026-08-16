import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { openDatabase } from 'csdm/node/database/open-database';
import { startBackgroundTasks } from 'csdm/server/start-background-tasks';

export async function connectDatabase(databaseSettings?: DatabaseSettings) {
  // The app owns the cluster lifecycle: connecting it to an external server is what releases the
  // bundled one, the CLI leaves it running.
  await openDatabase(databaseSettings, { releaseEmbeddedCluster: true });
  void startBackgroundTasks();
}
