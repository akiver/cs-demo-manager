import React, { Fragment } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import clsx from 'clsx';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { SyncIcon } from 'csdm/ui/icons/sync-icon';
import type { Round } from 'csdm/common/types/round';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { getTeamColor } from 'csdm/ui/styles/get-team-color';

type LineProps = {
  isIncluded: boolean;
  isSelected: boolean;
  onClick: () => void;
  label: string;
  winnerSide: TeamNumber;
  sideTeamA: TeamNumber;
};

function Line({ isIncluded, isSelected, label, onClick, sideTeamA, winnerSide }: LineProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isSelected}
      className="mx-4 flex h-16 grow border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-900"
      onClick={onClick}
      style={{
        alignItems: sideTeamA === winnerSide ? 'flex-start' : 'flex-end',
      }}
    >
      <span
        className={clsx('w-full rounded-4', isSelected ? 'h-4' : 'h-[2px]')}
        style={{
          backgroundColor: getTeamColor(winnerSide),
          opacity: isIncluded ? 1 : 0.3,
        }}
      />
    </button>
  );
}

type Props = {
  rounds: Round[];
  selectedRoundNumber: number;
  onSelectRound: (roundNumber: number) => void;
};

export function RoundsTimeline({ rounds, selectedRoundNumber, onSelectRound }: Props) {
  const { t } = useLingui();

  return (
    <div className="my-8 flex" role="group">
      {rounds.map((round, index) => {
        let isNextRoundSideSwitch = false;
        if (index < rounds.length - 1) {
          isNextRoundSideSwitch = round.teamASide !== rounds[index + 1].teamASide;
        }
        const roundNumber = round.number;
        const winnerTeamName = round.winnerTeamName;
        const label = t`Show stats through round ${roundNumber}`;
        const tooltip = t`Round ${roundNumber}: ${winnerTeamName} won`;
        const isIncluded = roundNumber <= selectedRoundNumber;
        const isSelected = roundNumber === selectedRoundNumber;

        return (
          <Fragment key={round.number}>
            <Tooltip content={tooltip}>
              <Line
                label={label}
                isIncluded={isIncluded}
                isSelected={isSelected}
                winnerSide={round.winnerSide}
                sideTeamA={round.teamASide}
                onClick={() => {
                  onSelectRound(roundNumber);
                }}
              />
            </Tooltip>
            {isNextRoundSideSwitch && (
              <Tooltip content={<Trans context="Tooltip">Switch sides</Trans>}>
                <SyncIcon className="mx-8 self-center" height={16} />
              </Tooltip>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
