import React from 'react';
import { Content } from 'csdm/ui/components/content';
import { PlayerWinRatePanel } from 'csdm/ui/player/overview/player-win-rate-panel';
import { PlayerMultiKillsPanel } from 'csdm/ui/player/overview/player-multi-kills-panel';
import { PlayerLastMatches } from 'csdm/ui/player/overview/player-last-matches';
import { PlayerObjectivesPanel } from './player-objectives-panel';
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
import { PlayerClutches } from 'csdm/ui/player/overview/player-clutches';
import { HltvRatingPanel } from 'csdm/ui/components/panels/hltv-rating-panel';
import { PlayerCommentInput } from './player-comment-input';
import { PlayerUtilitiesPanel } from './player-utilities-panel';
import { PlayerOpeningDuelsStats } from './player-opening-duels-panel';

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
    averageBlindTime,
    averageEnemiesFlashed,
    averageHeGrenadeDamage,
    averageSmokesThrownPerMatch,
  } = usePlayer();

  return (
    <Content>
      <div className="flex flex-col gap-y-12">
        <div className="flex gap-8 flex-wrap">
          <MatchmakingPanel />
          <PlayerWinRatePanel />
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
          <PlayerUtilitiesPanel
            averageBlindTime={averageBlindTime}
            averageEnemiesFlashed={averageEnemiesFlashed}
            averageHeGrenadeDamage={averageHeGrenadeDamage}
            averageSmokesThrownPerMatch={averageSmokesThrownPerMatch}
          />
          <PlayerOpeningDuelsStats />
          <RoundsPanel roundCount={roundCount} roundCountAsCt={roundCountAsCt} roundCountAsT={roundCountAsT} />
          <PlayerMultiKillsPanel />
          <PlayerObjectivesPanel />
          <VacPanel />
        </div>
        <div>
          <PlayerClutches />
        </div>
        <div>
          <PlayerLastMatches />
        </div>
        <div className="min-h-[128px] max-w-[512px] h-max">
          <PlayerCommentInput />
        </div>
      </div>
    </Content>
  );
}
