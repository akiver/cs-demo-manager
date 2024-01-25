import React from 'react';
import { EconomyType } from 'csdm/common/types/counter-strike';
import { useTranslateEconomyType } from './use-translate-economy-type';
import { roundNumberPercentage } from 'csdm/common/math/round-number-percentage';
import { getEconomyTypeColor } from './get-economy-type-color';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { Panel } from 'csdm/ui/components/panel';

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
  teamName: string;
  economyTypes: EconomyType[];
};

function TeamCard({ teamName, economyTypes }: TeamCardProps) {
  const pistolCount = economyTypes.filter((type) => {
    return type === EconomyType.Pistol;
  }).length;
  const pistolPercentage = roundNumberPercentage(pistolCount / economyTypes.length);
  const ecoCount = economyTypes.filter((type) => {
    return type === EconomyType.Eco;
  }).length;
  const ecoPercentage = roundNumberPercentage(ecoCount / economyTypes.length);
  const semiBuyCount = economyTypes.filter((type) => {
    return type === EconomyType.Semi;
  }).length;
  const forceBuyCount = economyTypes.filter((type) => {
    return type === EconomyType.ForceBuy;
  }).length;
  const semiBuyPercentage = roundNumberPercentage(semiBuyCount / economyTypes.length);
  const forceBuyPercentage = roundNumberPercentage(forceBuyCount / economyTypes.length);
  const fullBuyCount = economyTypes.filter((type) => {
    return type === EconomyType.Full;
  }).length;
  const fullBuyPercentage = roundNumberPercentage(fullBuyCount / economyTypes.length);

  return (
    <Panel header={teamName}>
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
  const economyTypesTeamA = match.rounds.map((round) => round.teamAEconomyType);
  const economyTypesTeamB = match.rounds.map((round) => round.teamBEconomyType);

  return (
    <div className="flex justify-around">
      <TeamCard teamName={match.teamA.name} economyTypes={economyTypesTeamA} />
      <TeamCard teamName={match.teamB.name} economyTypes={economyTypesTeamB} />
    </div>
  );
}
