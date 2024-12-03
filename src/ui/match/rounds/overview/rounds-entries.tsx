import React from 'react';
import { Trans } from '@lingui/react/macro';
import { SyncIcon } from 'csdm/ui/icons/sync-icon';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { useCurrentMatch } from '../../use-current-match';
import { RoundEntry } from './round-entry';

function SideSwitchIndicator() {
  return (
    <Tooltip content={<Trans context="Tooltip">Switch sides</Trans>}>
      <SyncIcon height={16} />
    </Tooltip>
  );
}

export function RoundsEntries() {
  const { rounds } = useCurrentMatch();

  return (
    <div className="flex flex-col gap-8">
      {rounds.map((round, index) => {
        let isNextRoundSideSwitch = false;
        if (index < rounds.length - 1) {
          isNextRoundSideSwitch = round.teamASide !== rounds[index + 1].teamASide;
        }

        return (
          <React.Fragment key={round.number}>
            <RoundEntry round={round} />
            {isNextRoundSideSwitch ? <SideSwitchIndicator /> : undefined}
          </React.Fragment>
        );
      })}
    </div>
  );
}
