import React from 'react';
import { Trans } from '@lingui/react/macro';
import { PerformanceTimeLineBar } from 'csdm/ui/components/valve-match/player-performance/performance-timeline-bar';
import type { ValvePlayer } from 'csdm/common/types/valve-match';
import type { Game } from 'csdm/common/types/counter-strike';

type Props = {
  player: ValvePlayer;
  demoPath: string | undefined;
  game: Game;
};

export function PerformanceTimeline({ player, demoPath, game }: Props) {
  const playerName = player.name;
  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <p>
        <Trans>
          <span className="text-body-strong">{playerName}</span> Round performance
        </Trans>
      </p>
      <div className="flex flex-1 items-center justify-center mt-8">
        {player.rounds.map((round) => {
          return <PerformanceTimeLineBar key={`round-${round.number}`} round={round} demoPath={demoPath} game={game} />;
        })}
      </div>
    </div>
  );
}
