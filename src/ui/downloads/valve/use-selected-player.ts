import { useSelectedMatch } from './use-selected-match';
import { useSelectedSteamId } from './use-selected-steam-id';

export function useSelectedPlayer() {
  const selectedMatch = useSelectedMatch();
  const selectedSteamId = useSelectedSteamId();
  const selectedPlayer = selectedMatch.players.find((player) => player.steamId === selectedSteamId);
  if (selectedPlayer === undefined) {
    throw new Error('No player selected');
  }

  return selectedPlayer;
}
