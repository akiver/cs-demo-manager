import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { FilterSelection } from 'csdm/ui/components/dropdown-filter/filter-selection';
import { FilterValue } from 'csdm/ui/components/dropdown-filter/filter-value';

type Props = {
  players: { steamId: string; name: string }[];
  onChange: (steamIds: string[]) => void;
  selectedSteamIds: string[];
  filter?: ReactNode;
};

export function PlayersSelect({
  players,
  onChange,
  selectedSteamIds,
  filter = (
    <FilterSelection
      onSelectAllClick={() => {
        onChange(players.map((round) => round.steamId));
      }}
      onDeselectAllClick={() => {
        onChange([]);
      }}
    />
  ),
}: Props) {
  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-baseline justify-between">
        <p>
          <Trans context="Players filter category">Players</Trans>
        </p>
        <div className="ml-16 mt-px">{filter}</div>
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
