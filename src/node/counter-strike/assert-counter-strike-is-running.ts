import { areProcessesRunning } from '../os/are-processes-running';
import { getCounterStrikeProcessNames } from './get-counter-strike-process-names';
import { CounterStrikeNotRunning } from './launcher/errors/counter-strike-not-running';

export async function assertCounterStrikeIsRunning() {
  const processNames = getCounterStrikeProcessNames();
  const atLeastOneProcessIsRunning = await areProcessesRunning(processNames);

  if (!atLeastOneProcessIsRunning) {
    throw new CounterStrikeNotRunning();
  }
}
