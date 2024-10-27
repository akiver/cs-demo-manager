import { Game } from 'csdm/common/types/counter-strike';
import { installCsGoServerPlugin, uninstallCsGoServerPlugin } from './csgo-server-plugin';
import { installCs2ServerPlugin, uninstallCs2ServerPlugin } from './cs2-server-plugin';

export function installCounterStrikeServerPlugin(game: Game) {
  if (game === Game.CSGO) {
    return installCsGoServerPlugin();
  } else {
    return installCs2ServerPlugin();
  }
}

export function uninstallCounterStrikeServerPlugin(game: Game) {
  if (game === Game.CSGO) {
    return uninstallCsGoServerPlugin();
  } else {
    return uninstallCs2ServerPlugin();
  }
}
