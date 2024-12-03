import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useDialog } from '../../dialogs/use-dialog';
import { useCounterStrike } from 'csdm/ui/hooks/use-counter-strike';
import { CounterStrikeRunningDialog } from '../../dialogs/counter-strike-running-dialog';

type Props = {
  demoPath: string;
  steamId: string;
};

export function WatchPlayerAsSuspectItem({ demoPath, steamId }: Props) {
  const { showDialog } = useDialog();
  const { isKillCsRequired, watchPlayerAsSuspect } = useCounterStrike();

  const startWatching = () => {
    watchPlayerAsSuspect({
      demoPath,
      steamId,
    });
  };

  const onClick = async () => {
    const shouldKillCs = await isKillCsRequired();
    if (shouldKillCs) {
      showDialog(<CounterStrikeRunningDialog onConfirmClick={startWatching} />);
    } else {
      startWatching();
    }
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu to watch a player as a suspect">As a suspect</Trans>
    </ContextMenuItem>
  );
}
