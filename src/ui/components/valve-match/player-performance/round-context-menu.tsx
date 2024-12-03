import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import type { ValvePlayerRound } from 'csdm/common/types/valve-match';
import { useCounterStrike } from 'csdm/ui/hooks/use-counter-strike';

type Props = {
  demoPath: string;
  round: ValvePlayerRound;
};

export function RoundContextMenu({ round, demoPath }: Props) {
  const { watchDemo } = useCounterStrike();

  const onWatchRoundClick = () => {
    watchDemo({
      demoPath,
      additionalArguments: [`startround:${round.number}`],
    });
  };

  return (
    <ContextMenu>
      <ContextMenuItem onClick={onWatchRoundClick}>
        <Trans>Watch round</Trans>
      </ContextMenuItem>
    </ContextMenu>
  );
}
