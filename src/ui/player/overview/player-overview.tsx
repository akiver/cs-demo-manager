import React from 'react';
import { Content } from 'csdm/ui/components/content';
import { WinRatePanel } from 'csdm/ui/player/overview/win-rate-panel';
import { MultiKillsPanel } from 'csdm/ui/player/overview/multi-kills-panel';
import { LastMatches } from 'csdm/ui/player/overview/last-matches';
import { ObjectivesPanel } from './objectives-panel';
import { MatchmakingPanel } from './matchmaking-panel';
import { VacPanel } from './vac-panel';
import { KillsPanel } from 'csdm/ui/components/panels/kills-panel';
import { usePlayer } from '../use-player';
import { KastPanel } from 'csdm/ui/components/panels/kast-panel';
import { HltvRating2Panel } from 'csdm/ui/components/panels/hltv-rating-2-panel';
import { HeadshotPanel } from 'csdm/ui/components/panels/headshot-panel';
import { AverageDamagesPerRoundPanel } from 'csdm/ui/components/panels/average-damages-per-round-panel';
import { RoundsPanel } from 'csdm/ui/components/panels/rounds-panel';
import { KillDeathRatioPanel } from 'csdm/ui/components/panels/kill-death-ratio-panel';
import { AverageKillsPerRoundPanel } from 'csdm/ui/components/panels/average-kills-per-round-panel';
import { AverageDeathsPerRoundPanel } from 'csdm/ui/components/panels/average-deaths-per-round-panel';
import { ClutchesPanel } from 'csdm/ui/player/overview/clutches-panel';
import { HltvRatingPanel } from 'csdm/ui/components/panels/hltv-rating-panel';
import { PlayerCommentInput } from './player-comment-input';

export function PlayerOverview() {
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
  } = usePlayer();

  return (
    <Content>
      <div className="flex flex-col gap-y-12">
        <div className="flex gap-8 flex-wrap">
          <MatchmakingPanel />
          <WinRatePanel />
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
          <MultiKillsPanel />
          <ObjectivesPanel />
          <VacPanel />
        </div>
        <div>
          <ClutchesPanel />
        </div>
        <div>
          <LastMatches />
        </div>
        <div className="min-h-[128px] max-w-[512px] h-max">
          <PlayerCommentInput />
        </div>
      </div>
    </Content>
  );
}
