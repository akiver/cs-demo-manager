import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { generatePlayersRoundsSequences } from 'csdm/ui/match/video/sequences/sequences-actions';
import { buildMatchVideoPath } from 'csdm/ui/routes-paths';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { SecondsInput } from 'csdm/ui/components/inputs/seconds-input';
import { ConfirmButton } from 'csdm/ui/components/buttons/confirm-button';

type GeneratePlayerRoundsDialogProps = {
  steamId: string;
};

function GeneratePlayerRoundsDialog({ steamId }: GeneratePlayerRoundsDialogProps) {
  const { hideDialog } = useDialog();
  const dispatch = useDispatch();
  const match = useCurrentMatch();
  const navigate = useNavigate();
  const { settings } = useVideoSettings();
  const [startSecondsBeforeEvent, setStartSecondsBeforeEvent] = useState(0);
  const [endSecondsAfterEvent, setEndSecondsAfterEvent] = useState(2);

  const submit = () => {
    hideDialog();
    dispatch(
      generatePlayersRoundsSequences({
        match,
        steamIds: [steamId],
        rounds: [],
        settings,
        startSecondsBeforeEvent,
        endSecondsAfterEvent,
        preserveExistingSequences: false,
      }),
    );
    setTimeout(() => {
      navigate(buildMatchVideoPath(match.checksum));
    }, 300);
  };

  return (
    <Dialog onEnterPressed={submit}>
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Options</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-8">
          <SecondsInput
            label={<Trans context="Input label">Seconds before the round starts to start the sequence</Trans>}
            defaultValue={startSecondsBeforeEvent}
            onChange={setStartSecondsBeforeEvent}
          />
          <SecondsInput
            label={
              <Trans context="Input label">Seconds after the round ends or the player dies to stop the sequence</Trans>
            }
            defaultValue={endSecondsAfterEvent}
            onChange={setEndSecondsAfterEvent}
          />
        </div>
      </DialogContent>
      <DialogFooter>
        <ConfirmButton onClick={submit} />
        <CancelButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}

type Props = {
  steamId: string;
};

export function GeneratePlayerRoundsVideoItem({ steamId }: Props) {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<GeneratePlayerRoundsDialog steamId={steamId} />);
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">Rounds</Trans>
    </ContextMenuItem>
  );
}
