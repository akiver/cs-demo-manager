import React from 'react';
import { EconomyType } from 'csdm/common/types/counter-strike';
import { useTranslateEconomyType } from './use-translate-economy-type';
import { roundNumberPercentage } from 'csdm/common/math/round-number-percentage';
import { getEconomyTypeColor } from './get-economy-type-color';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { Panel } from 'csdm/ui/components/panel';
import type { TeamEconomyStats } from 'csdm/common/types/team-economy-stats';

type EconomyStatsProps = {
  economyType: EconomyType;
  percentage: number;
};

function EconomyStats({ percentage, economyType }: EconomyStatsProps) {
  const { translateEconomyType } = useTranslateEconomyType();
  const color = getEconomyTypeColor(economyType);
  const economyTypeText = translateEconomyType(economyType);

  return (
    <div className="flex items-center">
      <div
        className="size-24 mr-4 rounded"
        style={{
          backgroundColor: color,
        }}
      />
      <div>
        <p className="text-title selectable">{percentage}%</p>
        <p className="selectable">{economyTypeText}</p>
      </div>
    </div>
  );
}

type TeamCardProps = {
  economyStats: TeamEconomyStats;
  roundCount: number;
};

function TeamCard({ economyStats, roundCount }: TeamCardProps) {
  const pistolPercentage = roundNumberPercentage(economyStats.pistolCount / roundCount);
  const ecoPercentage = roundNumberPercentage(economyStats.ecoCount / roundCount);
  const semiBuyPercentage = roundNumberPercentage(economyStats.semiCount / roundCount);
  const forceBuyPercentage = roundNumberPercentage(economyStats.forceBuyCount / roundCount);
  const fullBuyPercentage = roundNumberPercentage(economyStats.fullCount / roundCount);

  return (
    <Panel header={economyStats.teamName}>
      <div className="flex gap-12">
        <EconomyStats economyType={EconomyType.Pistol} percentage={pistolPercentage} />
        <EconomyStats economyType={EconomyType.Eco} percentage={ecoPercentage} />
        <EconomyStats economyType={EconomyType.Semi} percentage={semiBuyPercentage} />
        <EconomyStats economyType={EconomyType.ForceBuy} percentage={forceBuyPercentage} />
        <EconomyStats economyType={EconomyType.Full} percentage={fullBuyPercentage} />
      </div>
    </Panel>
  );
}

export function TeamEconomyCards() {
  const match = useCurrentMatch();
  const economyStatsTeamA = match.teamsEconomyStats.find((stats) => stats.teamName === match.teamA.name);
  const economyStatsTeamB = match.teamsEconomyStats.find((stats) => stats.teamName === match.teamB.name);

  if (!economyStatsTeamA || !economyStatsTeamB) {
    return null;
  }

  return (
    <div className="flex justify-around">
      <TeamCard economyStats={economyStatsTeamA} roundCount={match.rounds.length} />
      <TeamCard economyStats={economyStatsTeamB} roundCount={match.rounds.length} />
    </div>
  );
}
