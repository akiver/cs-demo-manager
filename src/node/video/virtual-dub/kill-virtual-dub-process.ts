import { killProcessesByNames } from 'csdm/node/os/kill-processes-by-names';

export async function killVirtualDubProcess() {
  const processName = process.arch === 'x64' ? 'Veedub64.exe' : 'VirtualDub.exe';

  await killProcessesByNames([processName]);
}
