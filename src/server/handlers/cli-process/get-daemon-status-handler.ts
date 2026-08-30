import type { Daemon } from 'csdm/common/types/daemon';
import { hasWorkInProgress } from 'csdm/server/idle-monitor/idle-monitor';
import pkg from '../../../../package.json' with { type: 'json' };

export async function getDaemonStatusHandler(): Promise<Daemon> {
  return Promise.resolve({
    version: pkg.version,
    busy: hasWorkInProgress(),
  });
}
