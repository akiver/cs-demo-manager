import React, { useState } from 'react';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { GrenadeOption } from 'csdm/ui/match/grenades/stats/grenade-option';
import { PlayersStatsGrid } from 'csdm/ui/match/grenades/stats/players-stats-grid';
import { GrenadeSelect } from 'csdm/ui/match/grenades/stats/grenade-select';
import { StatsLabel } from 'csdm/ui/match/grenades/stats/stats-label';
import { Panel } from 'csdm/ui/components/panel';
import { Content } from 'csdm/ui/components/content';
import { PlayersFlashbangMatrix } from 'csdm/ui/match/grenades/stats/players-flashbang-matrix';

type Filter = {
  grenade: GrenadeOption;
};

export function GrenadesStats() {
  const match = useCurrentMatch();
  const [filters, setFilters] = useState<Filter>({
    grenade: GrenadeOption.Flashbang,
  });
  const playersTeamA = match.players.filter((player) => {
    return player.teamName === match.teamA.name;
  });
  const playersTeamB = match.players.filter((player) => {
    return player.teamName === match.teamB.name;
  });

  return (
    <Content>
      <div className="flex flex-col gap-y-12">
        <Panel
          header={
            <div>
              <GrenadeSelect
                selectedGrenade={filters.grenade}
                onChange={(grenade: GrenadeOption) => {
                  setFilters({
                    ...filters,
                    grenade,
                  });
                }}
              />
            </div>
          }
        >
          <div className="grid self-start">
            <PlayersStatsGrid grenade={filters.grenade} players={playersTeamA} teamName={match.teamA.name} />
            <StatsLabel grenade={filters.grenade} />
            <div />
            <PlayersStatsGrid grenade={filters.grenade} players={playersTeamB} teamName={match.teamB.name} />
          </div>
        </Panel>
        <PlayersFlashbangMatrix />
      </div>
    </Content>
  );
}
