import React from 'react';
import { useCurrentRound } from './use-current-round';
import { Trans } from '@lingui/react/macro';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { formatMillisecondsToTimer } from 'csdm/ui/shared/format-milliseconds-to-timer';
import { TeamText } from 'csdm/ui/components/team-text';
import { PlayDemoAtTickButton } from '../play-demo-at-tick-button';

export function RoundTopBar() {
  const round = useCurrentRound();
  const match = useCurrentMatch();

  return (
    <div className="relative">
      <div className="flex items-center w-full px-12 py-8 border-b border-b-gray-300">
        <p className="mr-auto">#{round.number}</p>
        <div className="flex items-center gap-x-4">
          <TeamText teamNumber={round.teamASide}>{match.teamA.name}</TeamText>
          <TeamText teamNumber={round.teamASide} className="text-body-strong">
            {round.teamAScore}
          </TeamText>
        </div>
        <p className="mx-12">{formatMillisecondsToTimer(round.duration)}</p>
        <div className="flex items-center gap-x-4">
          <TeamText teamNumber={round.teamBSide} className="text-body-strong">
            {round.teamBScore}
          </TeamText>
          <TeamText teamNumber={round.teamBSide}>{match.teamB.name}</TeamText>
        </div>
        <div className="ml-auto">
          <PlayDemoAtTickButton
            demoPath={match.demoFilePath}
            game={match.game}
            tick={round.startTick}
            tooltip={<Trans context="Tooltip">Watch round</Trans>}
            size={20}
          />
        </div>
      </div>
    </div>
  );
}
