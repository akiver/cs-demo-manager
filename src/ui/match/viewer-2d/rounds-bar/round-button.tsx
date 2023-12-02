import React from 'react';
import type { Round } from 'csdm/common/types/round';
import { useViewerContext } from '../use-viewer-context';
import { TeamText } from 'csdm/ui/components/team-text';

type Props = {
  round: Round;
};

export function RoundButton({ round }: Props) {
  const { round: currentRound, changeRound } = useViewerContext();
  const onClick = () => {
    changeRound(round.number);
  };
  const isCurrent = currentRound.number === round.number;
  const classes = {
    current: 'bg-gray-300 hover:bg-gray-300',
    'not-current': 'bg-gray-50 hover:bg-gray-100',
  };

  return (
    <button
      className={`flex flex-col items-center border border-gray-300 justify-center w-48 min-w-48 text-gray-900 duration-85 transition-all cursor-pointer ${
        classes[isCurrent ? 'current' : 'not-current']
      }`}
      onClick={onClick}
    >
      {round.winnerSide !== null && <TeamText teamNumber={round.winnerSide}>●</TeamText>}
      <p>{round.number}</p>
    </button>
  );
}
