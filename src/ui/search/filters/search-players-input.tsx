import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { useWebSocketClient } from '../../hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useShowToast } from '../../components/toasts/use-show-toast';
import { SearchInput } from '../../components/inputs/search-input';
import type { PlayerResult } from 'csdm/common/types/search/player-result';
import type { PlayersFilter } from 'csdm/common/types/search/players-filter';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

type Props = {
  isDisabled: boolean;
  selectedPlayers: PlayerResult[];
  onPlayerSelected: (player: PlayerResult) => void;
  onPlayerRemoved: (player: PlayerResult) => void;
};

export function SearchPlayersInput({ isDisabled, selectedPlayers, onPlayerSelected, onPlayerRemoved }: Props) {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const _ = useI18n();

  return (
    <SearchInput<PlayerResult>
      isDisabled={isDisabled}
      placeholder={_(
        msg({
          context: 'Input placeholder',
          message: 'Nickname or SteamID',
        }),
      )}
      noResultMessage={_(msg`No players found`)}
      getValueId={(player) => player.steamId}
      onValueRemoved={onPlayerRemoved}
      onValueSelected={onPlayerSelected}
      renderResult={(player) => <span>{player.name}</span>}
      renderValue={(player) => <span>{player.name}</span>}
      selectedValues={selectedPlayers}
      search={async (value, ignoredPlayers) => {
        try {
          const payload: PlayersFilter = {
            steamIdOrName: value,
            ignoredSteamIds: ignoredPlayers.map((player) => player.steamId),
          };
          const players = await client.send({
            name: RendererClientMessageName.SearchPlayers,
            payload,
          });

          return players;
        } catch (error) {
          showToast({
            type: 'error',
            content: <Trans>An error occurred</Trans>,
          });
          return [];
        }
      }}
    />
  );
}
