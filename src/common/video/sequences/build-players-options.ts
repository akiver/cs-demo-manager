import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';
import type { MatchPlayer } from 'csdm/common/types/match-player';

type Options = {
  players: MatchPlayer[];
  // Players whose kills must be highlighted in death notices.
  highlightedSteamIds: string[];
  // Players whose voices must be heard. When undefined, it falls back to the "player voices" setting.
  voiceSteamIds: string[] | undefined;
  playerVoicesEnabled: boolean;
};

function getVoiceSteamIds({
  players,
  voiceSteamIds,
  playerVoicesEnabled,
}: Pick<Options, 'players' | 'voiceSteamIds' | 'playerVoicesEnabled'>) {
  if (voiceSteamIds !== undefined) {
    return voiceSteamIds;
  }

  return playerVoicesEnabled ? players.map((player) => player.steamId) : [];
}

export function buildPlayersOptions({ players, highlightedSteamIds, voiceSteamIds, playerVoicesEnabled }: Options) {
  const enabledVoiceSteamIds = getVoiceSteamIds({ players, voiceSteamIds, playerVoicesEnabled });
  const options: SequencePlayerOptions[] = players.map((player) => {
    return {
      steamId: player.steamId,
      playerName: player.name,
      showKill: true,
      highlightKill: highlightedSteamIds.includes(player.steamId),
      isVoiceEnabled: enabledVoiceSteamIds.includes(player.steamId),
    };
  });

  return options;
}
