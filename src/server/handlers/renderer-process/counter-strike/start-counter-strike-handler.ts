import { handleCounterStrikeError } from 'csdm/server/counter-strike';
import {
  startCounterStrike,
  type StartCounterStrikeOptions,
} from 'csdm/node/counter-strike/launcher/start-counter-strike';

export type StartCounterStrikePayload = Pick<
  StartCounterStrikeOptions,
  'game' | 'additionalLaunchParameters' | 'map' | 'mode'
>;

export async function startCounterStrikeHandler(payload: StartCounterStrikePayload) {
  try {
    await startCounterStrike(payload);
  } catch (error) {
    return handleCounterStrikeError(error);
  }
}
