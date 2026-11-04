import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { FilterSelection } from 'csdm/ui/components/dropdown-filter/filter-selection';
import { FilterValue } from 'csdm/ui/components/dropdown-filter/filter-value';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';

type Player = {
  steamId: string;
  name: string;
  teamName?: string;
};

type Props = {
  players: Player[];
  onChange: (steamIds: string[]) => void;
  selectedSteamIds: string[];
  filter?: ReactNode;
  label?: ReactNode;
};

type Team = {
  name: string;
  players: Player[];
};

// Players without a team name are grouped under an empty name, this group has no toggle.
function groupPlayersByTeam(players: Player[]): Team[] {
  const teams: Team[] = [];
  for (const player of players) {
    const teamName = player.teamName ?? '';
    let team = teams.find((team) => team.name === teamName);
    if (team === undefined) {
      team = { name: teamName, players: [] };
      teams.push(team);
    }
    team.players.push(player);
  }

  return teams;
}

type TeamToggleProps = {
  team: Team;
  selectedSteamIds: string[];
  onChange: (steamIds: string[]) => void;
};

function TeamToggle({ team, selectedSteamIds, onChange }: TeamToggleProps) {
  const teamSteamIds = team.players.map((player) => player.steamId);
  const selectedCount = teamSteamIds.filter((steamId) => selectedSteamIds.includes(steamId)).length;
  const areAllPlayersSelected = selectedCount === teamSteamIds.length;

  return (
    <Checkbox
      label={<span className="text-caption">{team.name}</span>}
      isChecked={areAllPlayersSelected}
      isIndeterminate={selectedCount > 0 && !areAllPlayersSelected}
      onChange={() => {
        if (areAllPlayersSelected) {
          onChange(selectedSteamIds.filter((steamId) => !teamSteamIds.includes(steamId)));
        } else {
          onChange([...new Set([...selectedSteamIds, ...teamSteamIds])]);
        }
      }}
    />
  );
}

type PlayersListProps = {
  players: Player[];
  selectedSteamIds: string[];
  onChange: (steamIds: string[]) => void;
};

function PlayersList({ players, selectedSteamIds, onChange }: PlayersListProps) {
  return (
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
  );
}

export function PlayersSelect({
  players,
  onChange,
  selectedSteamIds,
  label = <Trans context="Players filter category">Players</Trans>,
  filter = (
    <FilterSelection
      onSelectAllClick={() => {
        onChange(players.map((player) => player.steamId));
      }}
      onDeselectAllClick={() => {
        onChange([]);
      }}
    />
  ),
}: Props) {
  const teams = groupPlayersByTeam(players);
  const shouldGroupByTeam = teams.filter((team) => team.name !== '').length > 1;

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-baseline justify-between">
        <p>{label}</p>
        <div className="mt-px ml-16">{filter}</div>
      </div>
      {shouldGroupByTeam ? (
        teams.map((team) => {
          return (
            <div key={team.name} className="flex flex-col gap-y-4">
              {team.name !== '' && <TeamToggle team={team} selectedSteamIds={selectedSteamIds} onChange={onChange} />}
              <PlayersList players={team.players} selectedSteamIds={selectedSteamIds} onChange={onChange} />
            </div>
          );
        })
      ) : (
        <PlayersList players={players} selectedSteamIds={selectedSteamIds} onChange={onChange} />
      )}
    </div>
  );
}
