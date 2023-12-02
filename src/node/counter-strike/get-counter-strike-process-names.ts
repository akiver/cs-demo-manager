import { isMac } from 'csdm/node/os/is-mac';
import { isWindows } from 'csdm/node/os/is-windows';

export function getCounterStrikeProcessNames() {
  switch (true) {
    case isWindows:
      return ['csgo.exe', 'cs2.exe'];
    case isMac:
      return ['csgo_osx64', 'cs2'];
    default:
      return ['csgo_linux64', 'cs2'];
  }
}
