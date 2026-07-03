import React, { type ReactElement, type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { FilterValue } from 'csdm/ui/components/dropdown-filter/filter-value';

type Props = {
  players: { steamId: string; name: string; teamName: string }[];
  onChange: (steamIds: string[]) => void;
  selectedSteamIds: string[];
  filter?: ReactNode;
  label?: string | ReactElement;
};

export function PlayersSelectWithTeam({
  label = <Trans context="Players filter category">Players</Trans>,
  players,
  onChange,
  selectedSteamIds,
}: Props) {
  type TeamsDict = Record<string, { steamId: string; name: string; teamName: string }[]>;

  const teams = players.reduce<TeamsDict>((acc, player) => {
    const team = player.teamName;

    if (!acc[team]) {
      acc[team] = [];
    }

    acc[team].push(player);
    return acc;
  }, {});

  const teamFilters: SingleFilter[] = Object.entries(teams).map(([teamName, teamPlayers]) => ({
    label: teamName,
    onClick: () => {
      const steamIds = teamPlayers.map((p) => p.steamId);
      onChange(steamIds); // onChange should come from props or state
    },
  }));

  const filters: SingleFilter[] = [
    ...teamFilters,
    {
      label: <Trans context="Button filter">All</Trans>,
      onClick: () => onChange(players.map((p) => p.steamId)),
    },
    {
      label: <Trans context="Button filter">None</Trans>,
      onClick: () => onChange([]),
    },
  ];

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-baseline justify-between">
        <p>{label}</p>
        <div className="mt-px ml-16">
          <div className="flex items-center gap-x-8 pr-4">
            <Filters filters={filters} />
          </div>
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

type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};

function Button({ children, onClick }: ButtonProps) {
  return (
    <button className="cursor-auto text-caption hover:text-gray-900" onClick={onClick}>
      {children}
    </button>
  );
}

type SingleFilter = {
  label: string | ReactElement;
  onClick: () => void;
};

function Filters({ filters }: { filters: SingleFilter[] }) {
  return (
    <>
      {filters.map((f, index) => (
        <Button key={index} onClick={() => f.onClick()}>
          {f.label}
        </Button>
      ))}
    </>
  );
}
