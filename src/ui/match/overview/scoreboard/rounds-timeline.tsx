import React, { Fragment } from 'react';
import { Trans } from '@lingui/react/macro';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { SyncIcon } from 'csdm/ui/icons/sync-icon';
import type { Round } from 'csdm/common/types/round';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { getTeamColor } from 'csdm/ui/styles/get-team-color';

type LineProps = {
  winnerSide: TeamNumber;
  sideTeamA: TeamNumber;
};

function Line({ sideTeamA, winnerSide }: LineProps) {
  return (
    <div
      className="flex grow mx-4 h-[2px]"
      style={{
        alignSelf: sideTeamA === winnerSide ? 'flex-start' : 'flex-end',
        backgroundColor: getTeamColor(winnerSide),
      }}
    />
  );
}

type Props = {
  rounds: Round[];
};

export function RoundsTimeline({ rounds }: Props) {
  return (
    <div className="flex my-8">
      {rounds.map((round, index) => {
        let isNextRoundSideSwitch = false;
        if (index < rounds.length - 1) {
          isNextRoundSideSwitch = round.teamASide !== rounds[index + 1].teamASide;
        }

        return (
          <Fragment key={round.number}>
            <Line winnerSide={round.winnerSide} sideTeamA={round.teamASide} />
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
