import type { ReactNode } from 'react';
import React from 'react';
import { RoundEndReasonIcon } from '../../../icons/round-end-reason-icon';
import { useCurrentMatch } from '../../use-current-match';

function Cell({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center bg-gray-50">
      <span>{children}</span>
    </div>
  );
}

function TitleCell({ title }: { title: string }) {
  return (
    <Cell>
      <p className="truncate px-8 max-w-[248px] mr-auto" title={title}>
        {title}
      </p>
    </Cell>
  );
}

export function RoundsHistory() {
  const { teamA, teamB, rounds } = useCurrentMatch();

  return (
    <div
      className="grid grid-rows-[30px_repeat(2,_35px)] gap-px grid-flow-col max-w-fit overflow-x-auto border border-gray-300 bg-gray-300 flex-none mb-12"
      style={{
        gridTemplateColumns: `auto repeat(${rounds.length}, 40px)`,
      }}
    >
      <TitleCell title="Round" />
      <TitleCell title={teamA.name} />
      <TitleCell title={teamB.name} />
      {rounds.map((round) => {
        return (
          <React.Fragment key={`round-${round.number}`}>
            <Cell>{round.number}</Cell>
            <Cell>{round.winnerTeamName === teamA.name && <RoundEndReasonIcon round={round} />}</Cell>
            <Cell>{round.winnerTeamName === teamB.name && <RoundEndReasonIcon round={round} />}</Cell>
          </React.Fragment>
        );
      })}
    </div>
  );
}
