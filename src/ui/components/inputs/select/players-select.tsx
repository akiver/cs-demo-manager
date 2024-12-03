import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Player } from 'csdm/common/types/player';
import { FilterSelection } from '../../dropdown-filter/filter-selection';
import { FilterValue } from '../../dropdown-filter/filter-value';

type Props = {
  players: Player[];
  onChange: (steamIds: string[]) => void;
  selectedSteamIds: string[];
};

export function PlayersSelect({ players, onChange, selectedSteamIds }: Props) {
  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-baseline">
        <p>
          <Trans context="Players filter category">Players</Trans>
        </p>
        <div className="ml-16 mt-px">
          <FilterSelection
            onSelectAllClick={() => {
              onChange(players.map((round) => round.steamId));
            }}
            onDeselectAllClick={() => {
              onChange([]);
            }}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        {players.map((player) => {
          const isSelected = selectedSteamIds.includes(player.steamId);

          return (
            <FilterValue
              key={player.steamId}
              isSelected={isSelected}
              onClick={() => {
                onChange(
                  isSelected
                    ? selectedSteamIds.filter((steamId) => steamId !== player.steamId)
                    : [...selectedSteamIds, player.steamId],
                );
              }}
            >
              {player.name}
            </FilterValue>
          );
        })}
      </div>
    </div>
  );
}
