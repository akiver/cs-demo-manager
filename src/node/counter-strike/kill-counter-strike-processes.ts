import { killProcessesByNames } from 'csdm/node/os/kill-processes-by-names';
import { getCounterStrikeProcessNames } from './get-counter-strike-process-names';

export async function killCounterStrikeProcesses() {
  const processNames = getCounterStrikeProcessNames();
  const atLeastOneProcessHasBeenKilled = await killProcessesByNames(processNames);

  return atLeastOneProcessHasBeenKilled;
}
