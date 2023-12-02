import { isCounterStrikeRunning } from 'csdm/node/counter-strike/is-counter-strike-running';

export async function isCounterStrikeRunningHandler() {
  const isRunning = await isCounterStrikeRunning();

  return isRunning;
}
