import React, { useState } from 'react';
import { Trans } from '@lingui/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { useCurrentMatch } from '../use-current-match';
import { generatePlayerKillsSequences } from './sequences/sequences-actions';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useDispatch } from 'csdm/ui/store/use-dispatch';

function SelectPlayerDialog() {
  const dispatch = useDispatch();
  const match = useCurrentMatch();
  const { hideDialog } = useDialog();
  const options: SelectOption[] = match.players.map((player) => {
    return {
      value: player.steamId,
      label: player.name,
    };
  });
  const [selectedSteamId, setSelectedSteamId] = useState(options.length > 0 ? options[0].value : undefined);
  const onConfirm = () => {
    if (selectedSteamId !== undefined) {
      dispatch(
        generatePlayerKillsSequences({
          steamId: selectedSteamId,
          match,
        }),
      );
    }
    hideDialog();
  };

  return (
    <Dialog onEnterPressed={onConfirm}>
      <DialogHeader>
        <DialogTitle>
          <Trans>Player's kill sequences</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-12 max-w-[512px]">
          <div className="flex flex-col gap-y-8">
            <label htmlFor="player">
              <Trans context="Select label">Player</Trans>
            </label>
            <div>
              <Select
                id="player"
                options={options}
                value={selectedSteamId}
                onChange={(steamId) => {
                  setSelectedSteamId(steamId);
                }}
              />
            </div>
          </div>
          <p>
            <Trans>
              If 2 kills are less than 10 seconds apart or 2 sequences are less than 2 seconds apart, a single sequence
              will be generated.
            </Trans>
          </p>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button onClick={onConfirm} variant={ButtonVariant.Primary}>
          <Trans context="Button">Confirm</Trans>
        </Button>
        <CancelButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}

export function GeneratePlayerKillsSequencesButton() {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<SelectPlayerDialog />);
  };

  return (
    <Button onClick={onClick}>
      <Trans context="Button">Generate player's kill sequences</Trans>
    </Button>
  );
}
