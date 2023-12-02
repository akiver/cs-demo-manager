import { isMac } from 'csdm/node/os/is-mac';
import { isWindows } from 'csdm/node/os/is-windows';
import { areProcessesRunning } from 'csdm/node/os/are-processes-running';

export async function isSteamRunning(): Promise<boolean> {
  let processName: string;
  switch (true) {
    case isWindows:
      processName = 'steam.exe';
      break;
    case isMac:
      processName = 'steam_osx';
      break;
    default:
      processName = 'steam';
  }

  const processIsRunning = await areProcessesRunning([processName]);

  return processIsRunning;
}
