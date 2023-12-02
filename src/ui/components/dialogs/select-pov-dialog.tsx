import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { Button } from 'csdm/ui/components/buttons/button';
import { Perspective } from 'csdm/common/types/perspective';
import { useCounterStrike } from 'csdm/ui/hooks/use-counter-strike';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { WatchType } from 'csdm/common/types/watch-type';
import { CancelButton } from '../buttons/cancel-button';
import { Trans } from '@lingui/macro';

type Props = {
  type: WatchType;
  playerSteamId: string;
  demoPath: string;
};

export function SelectPovDialog({ playerSteamId, demoPath, type }: Props) {
  const { watchPlayerHighlights, watchPlayerLowlights } = useCounterStrike();
  const { hideDialog } = useDialog();

  const startGame = (perspective: Perspective) => {
    if (type === WatchType.Highlights) {
      watchPlayerHighlights({
        demoPath,
        steamId: playerSteamId,
        perspective,
      });
    } else {
      watchPlayerLowlights({
        demoPath,
        steamId: playerSteamId,
        perspective,
      });
    }

    hideDialog();
  };

  const onEnemyPovClick = () => {
    startGame(Perspective.Enemy);
  };

  const onPlayerPovClick = () => {
    startGame(Perspective.Player);
  };

  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle>
          <Trans>Point of view</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <p>
          <Trans>Do you want to watch it from the player's POV or the enemy's POV?</Trans>
        </p>
      </DialogContent>
      <DialogFooter>
        <Button onClick={onPlayerPovClick}>
          <Trans context="Watch from player point of view">Player</Trans>
        </Button>
        <Button onClick={onEnemyPovClick}>
          <Trans context="Watch from enemy point of view">Enemy</Trans>
        </Button>
        <CancelButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
