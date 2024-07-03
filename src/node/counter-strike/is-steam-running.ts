import { isMac } from 'csdm/node/os/is-mac';
import { isWindows } from 'csdm/node/os/is-windows';
import { areProcessesRunning } from 'csdm/node/os/are-processes-running';

export async function isSteamRunning(): Promise<boolean> {
  let processNames: string[] = [];
  switch (true) {
    case isWindows:
      // Steam China is available only on Windows ATTOW
      // https://store.steamchina.com/about/
      processNames = ['steam.exe', 'steamchina.exe'];
      break;
    case isMac:
      processNames = ['steam_osx'];
      break;
    default:
      processNames = ['steam'];
  }

  const processIsRunning = await areProcessesRunning(processNames);

  return processIsRunning;
}
