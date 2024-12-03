import React from 'react';
import { TeamNumber } from 'csdm/common/types/counter-strike';
import { TeamText } from 'csdm/ui/components/team-text';
import type { ValveMatch, ValvePlayer } from 'csdm/common/types/valve-match';
import { ValveMatchScoreboard } from 'csdm/ui/components/valve-match/valve-match-scoreboard';
import { PerformanceTimeline } from './player-performance/performance-timeline';
import { useIsDemoAnalysisInProgress } from 'csdm/ui/analyses/use-is-demo-analysis-in-progress';
import { Trans } from '@lingui/react/macro';
import { Spinner } from '../spinner';

type TeamScoreProps = {
  teamName: string;
  teamScore: number;
  side: TeamNumber;
};

function TeamScore({ teamName, teamScore, side }: TeamScoreProps) {
  return (
    <div className="flex items-center">
      <TeamText className="text-title mr-4" teamNumber={side}>
        {teamScore}
      </TeamText>
      <TeamText className="text-body-strong" teamNumber={side}>
        {teamName}
      </TeamText>
    </div>
  );
}

type Props = {
  match: ValveMatch;
  demoPath: string | undefined;
  selectedPlayer: ValvePlayer;
  onPlayerSelected: (player: ValvePlayer) => void;
};

export function ValveMatchOverview({ match, demoPath, selectedPlayer, onPlayerSelected }: Props) {
  const cts = match.players.filter((player) => player.startMatchTeamNumber === TeamNumber.CT);
  const terrorists = match.players.filter((player) => player.startMatchTeamNumber === TeamNumber.T);
  const isDemoAnalysisInProgress = useIsDemoAnalysisInProgress();

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col m-auto">
        {match.demoChecksum && isDemoAnalysisInProgress(match.demoChecksum) && (
          <div className="flex items-center gap-x-8 self-center">
            <Spinner size={24} />
            <p>
              <Trans>Demo analysis in progress.</Trans>
            </p>
          </div>
        )}
        <div className="flex flex-col">
          <TeamScore teamScore={match.scoreTeamStartedCT} teamName={match.teamNameStartedCT} side={TeamNumber.CT} />
          <ValveMatchScoreboard
            players={cts}
            onPlayerSelected={onPlayerSelected}
            demoPath={demoPath}
            game={match.game}
          />
        </div>
        <div className="flex flex-col mt-12">
          <TeamScore teamScore={match.scoreTeamStartedT} teamName={match.teamNameStartedT} side={TeamNumber.T} />
          <ValveMatchScoreboard
            players={terrorists}
            onPlayerSelected={onPlayerSelected}
            demoPath={demoPath}
            game={match.game}
          />
        </div>
      </div>
      <PerformanceTimeline player={selectedPlayer} demoPath={demoPath} game={match.game} />
    </div>
  );
}
