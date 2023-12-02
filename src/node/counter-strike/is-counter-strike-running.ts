import { areProcessesRunning } from 'csdm/node/os/are-processes-running';
import { getCounterStrikeProcessNames } from './get-counter-strike-process-names';

export async function isCounterStrikeRunning() {
  const processNames = getCounterStrikeProcessNames();
  const atLeastOneProcessIsRunning = await areProcessesRunning(processNames);

  return atLeastOneProcessIsRunning;
}
