import React, { memo } from 'react';
import { RoundButton } from './round-button';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';

export const RoundsBar = memo(() => {
  const match = useCurrentMatch();

  return (
    <div className="flex relative h-48 bg-gray-50 border-b border-b-gray-300 overflow-auto">
      {match.rounds.map((round) => {
        return <RoundButton key={round.number} round={round} />;
      })}
    </div>
  );
});

RoundsBar.displayName = 'RoundsBar';
