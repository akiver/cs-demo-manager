import type { Game } from 'csdm/common/types/counter-strike';
import { startCounterStrike } from 'csdm/node/counter-strike/launcher/start-counter-strike';
import { handleCounterStrikeError, onGameStart } from 'csdm/server/counter-strike';
import { isCounterStrikeRunning } from 'csdm/node/counter-strike/is-counter-strike-running';
import { CounterStrikeAlreadyRunning } from 'csdm/node/counter-strike/launcher/errors/counter-strike-already-running';
import { getSettings } from 'csdm/node/settings/get-settings';
import { startCounterStrikeWithHlae } from 'csdm/node/counter-strike/launcher/start-counter-strike-with-hlae';

export async function startCounterStrikeHandler(game: Game) {
  try {
    const isCsRunning = await isCounterStrikeRunning();
    if (isCsRunning) {
      throw new CounterStrikeAlreadyRunning(game);
    }
    const settings = await getSettings();
    if (settings.playback.useHlae) {
      await startCounterStrikeWithHlae({ game, onGameStart });
    } else {
      await startCounterStrike({ game, onGameStart });
    }
  } catch (error) {
    return handleCounterStrikeError(error);
  }
}
