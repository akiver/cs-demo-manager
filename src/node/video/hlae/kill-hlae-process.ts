import { killProcessesByNames } from 'csdm/node/os/kill-processes-by-names';

export async function killHlaeProcess() {
  await killProcessesByNames(['hlae.exe']);
}
