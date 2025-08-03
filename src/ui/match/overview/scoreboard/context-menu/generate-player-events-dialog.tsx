import React, { useState, type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { useNavigate } from 'react-router';
import { Perspective } from 'csdm/common/types/perspective';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { PerspectiveSelect } from 'csdm/ui/components/inputs/select/perspective-select';
import { SecondsInput } from 'csdm/ui/components/inputs/seconds-input';
import { buildMatchVideoPath } from 'csdm/ui/routes-paths';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import type { GeneratePlayersEventPayload } from 'csdm/ui/match/video/sequences/sequences-actions';
import { ConfirmButton } from 'csdm/ui/components/buttons/confirm-button';

type Props = {
  steamId: string;
  generateSequences: (payload: GeneratePlayersEventPayload) => void;
  secondsBeforeLabel: ReactNode;
  secondsAfterLabel: ReactNode;
};

export function GeneratePlayerEventsDialog({
  steamId,
  generateSequences,
  secondsBeforeLabel,
  secondsAfterLabel,
}: Props) {
  const { hideDialog } = useDialog();
  const match = useCurrentMatch();
  const navigate = useNavigate();
  const { settings } = useVideoSettings();
  const [perspective, setPerspective] = useState<Perspective>(Perspective.Player);
  const [startSecondsBeforeEvent, setStartSecondsBeforeEvent] = useState(2);
  const [endSecondsAfterEvent, setEndSecondsAfterEvent] = useState(2);

  const submit = () => {
    hideDialog();
    generateSequences({
      match,
      steamIds: [steamId],
      perspective,
      rounds: [],
      weapons: [],
      settings,
      startSecondsBeforeEvent,
      endSecondsAfterEvent,
      preserveExistingSequences: false,
    });

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
          <PerspectiveSelect perspective={perspective} onChange={setPerspective} />
          <SecondsInput
            label={secondsBeforeLabel}
            defaultValue={startSecondsBeforeEvent}
            onChange={setStartSecondsBeforeEvent}
          />
          <SecondsInput
            label={secondsAfterLabel}
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
