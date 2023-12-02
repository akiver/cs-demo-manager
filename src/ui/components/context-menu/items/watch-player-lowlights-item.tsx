import React from 'react';
import { Trans } from '@lingui/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useDialog } from '../../dialogs/use-dialog';
import { useCounterStrike } from 'csdm/ui/hooks/use-counter-strike';
import { useWatchSettings } from 'csdm/ui/settings/playback/use-watch-settings';
import { SelectPovDialog } from '../../dialogs/select-pov-dialog';
import { WatchType } from 'csdm/common/types/watch-type';
import { Perspective } from 'csdm/common/types/perspective';
import { CounterStrikeRunningDialog } from '../../dialogs/counter-strike-running-dialog';
import { Game } from 'csdm/common/types/counter-strike';

type Props = {
  demoPath: string;
  steamId: string;
  game: Game;
};

export function WatchPlayerLowlightsItem({ demoPath, steamId, game }: Props) {
  const { showDialog } = useDialog();
  const { isKillCsRequired, watchPlayerLowlights } = useCounterStrike();
  const { useCustomLowlights } = useWatchSettings();

  const startPlayerLowlights = () => {
    if (useCustomLowlights || game !== Game.CSGO) {
      showDialog(<SelectPovDialog demoPath={demoPath} playerSteamId={steamId} type={WatchType.Lowlights} />);
    } else {
      watchPlayerLowlights({
        demoPath,
        steamId,
        perspective: Perspective.Player,
      });
    }
  };

  const onClick = async () => {
    const shouldKillCs = await isKillCsRequired();
    if (shouldKillCs) {
      showDialog(<CounterStrikeRunningDialog closeOnConfirm={false} onConfirmClick={startPlayerLowlights} />);
    } else {
      startPlayerLowlights();
    }
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu watch player lowlights">Lowlights</Trans>
    </ContextMenuItem>
  );
}
