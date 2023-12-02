import { isSteamRunning } from 'csdm/node/counter-strike/is-steam-running';
import { SteamNotRunning } from 'csdm/node/counter-strike/launcher/errors/steam-not-running';

export async function assertSteamIsRunning() {
  const steamRunning = await isSteamRunning();
  if (!steamRunning) {
    throw new SteamNotRunning();
  }
}
