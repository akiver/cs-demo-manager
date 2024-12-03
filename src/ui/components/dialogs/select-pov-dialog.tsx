import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { Button } from 'csdm/ui/components/buttons/button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { CancelButton } from '../buttons/cancel-button';

type Props = {
  onPlayerClick: () => void;
  onEnemyClick: () => void;
};

export function SelectPovDialog({ onPlayerClick, onEnemyClick }: Props) {
  const { hideDialog } = useDialog();

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
        <Button
          onClick={() => {
            hideDialog();
            onPlayerClick();
          }}
        >
          <Trans context="Watch from player point of view">Player</Trans>
        </Button>
        <Button
          onClick={() => {
            hideDialog();
            onEnemyClick();
          }}
        >
          <Trans context="Watch from enemy point of view">Enemy</Trans>
        </Button>
        <CancelButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
