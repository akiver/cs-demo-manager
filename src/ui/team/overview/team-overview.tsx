import React from 'react';
import { Content } from 'csdm/ui/components/content';
import { TeamWinRatePanel } from 'csdm/ui/team/overview/team-win-rate-panel';
import { KillsPanel } from 'csdm/ui/components/panels/kills-panel';
import { useTeam } from '../use-team';
import { KastPanel } from 'csdm/ui/components/panels/kast-panel';
import { HltvRating2Panel } from 'csdm/ui/components/panels/hltv-rating-2-panel';
import { HeadshotPanel } from 'csdm/ui/components/panels/headshot-panel';
import { AverageDamagesPerRoundPanel } from 'csdm/ui/components/panels/average-damages-per-round-panel';
import { RoundsPanel } from 'csdm/ui/components/panels/rounds-panel';
import { KillDeathRatioPanel } from 'csdm/ui/components/panels/kill-death-ratio-panel';
import { AverageKillsPerRoundPanel } from 'csdm/ui/components/panels/average-kills-per-round-panel';
import { AverageDeathsPerRoundPanel } from 'csdm/ui/components/panels/average-deaths-per-round-panel';
import { HltvRatingPanel } from 'csdm/ui/components/panels/hltv-rating-panel';
import { TeamLastMatches } from './team-last-matches';
import { TeamClutches } from './team-clutches';
import { TeamMultiKillsPanel } from './team-multi-kills-panel';
import { TeamObjectivesPanel } from './team-objectives-panel';

export function TeamOverview() {
  const {
    killDeathRatio,
    killCount,
    deathCount,
    assistCount,
    wallbangKillCount,
    collateralKillCount,
    kast,
    hltvRating,
    hltvRating2,
    headshotCount,
    headshotPercentage,
    averageKillsPerRound,
    averageDeathsPerRound,
    averageDamagePerRound,
    roundCount,
    roundCountAsCt,
    roundCountAsT,
  } = useTeam();

  return (
    <Content>
      <div className="flex flex-col gap-y-12">
        <div className="flex gap-8 flex-wrap">
          <TeamWinRatePanel />
          <div className="flex flex-col gap-y-8">
            <HltvRatingPanel hltvRating={hltvRating} />
            <HltvRating2Panel hltvRating2={hltvRating2} />
          </div>
          <div className="flex flex-col gap-y-8">
            <KastPanel kast={kast} />
          </div>
          <div className="flex flex-col gap-y-8">
            <KillDeathRatioPanel killDeathRatio={killDeathRatio} />
            <AverageDamagesPerRoundPanel averageDamagePerRound={averageDamagePerRound} />
          </div>
          <div className="flex flex-col gap-y-8">
            <AverageKillsPerRoundPanel averageKillsPerRound={averageKillsPerRound} />
            <AverageDeathsPerRoundPanel averageDeathsPerRound={averageDeathsPerRound} />
          </div>
          <HeadshotPanel
            headshotPercentage={headshotPercentage}
            headshotCount={headshotCount}
            killCount={killCount}
            assistCount={assistCount}
            deathCount={deathCount}
          />
          <KillsPanel collateralKillCount={collateralKillCount} wallbangKillCount={wallbangKillCount} />
          <RoundsPanel roundCount={roundCount} roundCountAsCt={roundCountAsCt} roundCountAsT={roundCountAsT} />
          <TeamMultiKillsPanel />
          <TeamObjectivesPanel />
        </div>
        <div>
          <TeamClutches />
        </div>
        <div>
          <TeamLastMatches />
        </div>
      </div>
    </Content>
  );
}
