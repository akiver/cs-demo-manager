import { watchDemo } from 'csdm/node/counter-strike/launcher/watch-demo';
import { onGameStart } from 'csdm/server/counter-strike';
import { ensureDatabaseConnection } from 'csdm/server/ensure-database-connection';
import type { WatchDemoPayload } from '../renderer-process/counter-strike/watch-demo-handler';
import { throwErrorCodeOrMessage } from './throw-error-code-or-message';

export type WatchDemoFromCliResult = {
  // False when the demo has been sent to a game already running, the reply is then sent without waiting for the game
  // to exit.
  hasStartedGame: boolean;
};

export async function watchDemoFromCliHandler(payload: WatchDemoPayload): Promise<WatchDemoFromCliResult> {
  try {
    // The player slot to focus and the timeline and cameras files of the playback come from the database.
    try {
      await ensureDatabaseConnection();
    } catch (error) {
      // The playback files are optional, they are skipped without a connection.
      if (payload.focusSteamId) {
        throw error;
      }
    }

    let hasStartedGame = false;
    await watchDemo({
      ...payload,
      onGameStart: () => {
        hasStartedGame = true;
        onGameStart();
      },
    });

    return { hasStartedGame };
  } catch (error) {
    throwErrorCodeOrMessage(error, 'Error watching demo from CLI');
  }
}
