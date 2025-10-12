import { handleCounterStrikeError } from 'csdm/server/counter-strike';
import { startCounterStrike } from 'csdm/node/counter-strike/launcher/start-counter-strike';
import type { Game } from 'csdm/common/types/counter-strike';

export type StartCounterStrikePayload = {
  game: Game;
  additionalLaunchParameters?: string[];
};

export async function startCounterStrikeHandler(payload: StartCounterStrikePayload) {
  try {
    await startCounterStrike(payload);
  } catch (error) {
    return handleCounterStrikeError(error);
  }
}
