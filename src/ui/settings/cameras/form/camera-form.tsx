import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { FieldError } from 'csdm/ui/components/form/field-error';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { SaveButton } from 'csdm/ui/components/buttons/save-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { Trans } from '@lingui/react/macro';
import { ExternalLink } from 'csdm/ui/components/external-link';
import type { CameraPayload } from 'csdm/server/handlers/renderer-process/cameras/camera-payload';
import { useCameraForm } from './use-camera-form';
import { CoordinateXInput } from './coordinate-x-input';
import { CoordinateYInput } from './coordinate-y-input';
import { CoordinateZInput } from './coordinate-z-input';
import { PitchInput } from './pitch-input';
import { YawInput } from './yaw-input';
import { CameraPreviewInput } from './camera-preview-input';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useCounterStrike } from 'csdm/ui/hooks/use-counter-strike';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { Game } from 'csdm/common/types/counter-strike';
import { isErrorCode } from 'csdm/common/is-error-code';
import { ErrorCode } from 'csdm/common/error-code';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { extractCoordinatesFromCommand } from './extract-coordinates-from-setpos-command';
import { sleep } from 'csdm/common/sleep';
import { SpinnableButton } from 'csdm/ui/components/buttons/spinnable-button';
import { CounterStrikeRunningDialog } from 'csdm/ui/components/dialogs/counter-strike-running-dialog';
import { CameraColorInput } from './camera-color-input';
import { DialogProvider } from 'csdm/ui/components/dialogs/dialog-provider';
import { CAMERA_FORM_ELEMENT_ID } from 'csdm/ui/shared/element-ids';
import { resizeImageFromFilePath } from 'csdm/ui/shared/resize-image';
import { getPlaybackErrorMessageFromErrorCode } from 'csdm/ui/shared/get-playback-error-from-error-code';
import type { CameraCoordinates } from 'csdm/common/types/camera';
import { getGameName } from 'csdm/ui/shared/get-game-name';
import { roundNumber } from 'csdm/common/math/round-number';

function InputsRow({ children }: { children: ReactNode }) {
  return <div className="flex gap-x-12">{children}</div>;
}

function StartGameButton() {
  const { startGame, isCsRunning } = useCounterStrike();
  const { showDialog } = useDialog();
  const { game, mapName } = useCameraForm();
  const gameName = getGameName(game);

  return (
    <Button
      onClick={async () => {
        const start = () => {
          startGame({
            game,
            map: mapName,
            mode: 'spectate',
          });
        };

        const csIsRunning = await isCsRunning();
        if (csIsRunning) {
          showDialog(<CounterStrikeRunningDialog onConfirmClick={start} />);
        } else {
          start();
        }
      }}
    >
      <Trans>
        Start {gameName} on {mapName}
      </Trans>
    </Button>
  );
}

type Props = {
  nameInput: ReactNode;
  error: string | undefined;
  onSubmit: (payload: CameraPayload) => Promise<void>;
};

export function CameraForm({ nameInput, error, onSubmit }: Props) {
  const { fields, validate, setField, id, game, mapName } = useCameraForm();
  const { hideDialog } = useDialog();
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const [isLoading, setIsLoading] = useState(false);

  const validateAndSubmit = () => {
    const isValid = validate();
    if (isValid) {
      const payload: CameraPayload = {
        id,
        name: fields.name.value,
        game,
        mapName,
        x: Number(fields.x.value),
        y: Number(fields.y.value),
        z: Number(fields.z.value),
        yaw: Number(fields.yaw.value),
        pitch: Number(fields.pitch.value),
        comment: fields.comment.value,
        previewBase64: fields.previewBase64.value,
        color: fields.color.value,
      };

      onSubmit(payload);
    }
  };

  return (
    <Dialog
      onEnterPressed={(event) => {
        event.preventDefault();
        validateAndSubmit();
      }}
    >
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Camera</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-8" id={CAMERA_FORM_ELEMENT_ID}>
          <div className="mb-16 flex items-center gap-x-8">
            <DialogProvider inertElementId={CAMERA_FORM_ELEMENT_ID}>
              <StartGameButton />
            </DialogProvider>

            <SpinnableButton
              isLoading={isLoading}
              variant={ButtonVariant.Default}
              onClick={async () => {
                try {
                  setIsLoading(true);

                  const isCsgo = game === Game.CSGO;
                  if (!isCsgo) {
                    window.csdm.clearClipboard(); // clear the clipboard to ensure we don't read an old setpos command
                  }

                  const result = await client.send({
                    name: RendererClientMessageName.CapturePlayerView,
                    payload: game,
                  });

                  const base64 = await resizeImageFromFilePath(result.screenshotPath, 800);
                  setField('previewBase64', base64);
                  let coordinates: CameraCoordinates | null = result.game === Game.CSGO ? result : null;
                  if (!isCsgo) {
                    await sleep(500); // Wait a moment to ensure the clipboard is up-to-date.
                    const setposCommand = window.csdm.getClipboardText();
                    coordinates = extractCoordinatesFromCommand(setposCommand);
                  }

                  if (coordinates) {
                    const { x, y, z, pitch, yaw } = coordinates;
                    setField('x', roundNumber(x, 1).toString());
                    setField('y', roundNumber(y, 1).toString());
                    setField('z', roundNumber(z, 1).toString());
                    setField('yaw', roundNumber(yaw, 1).toString());
                    setField('pitch', roundNumber(pitch, 1).toString());
                  }
                } catch (error) {
                  const errorCode = isErrorCode(error) ? error : ErrorCode.UnknownError;
                  let message = getPlaybackErrorMessageFromErrorCode(game, errorCode);
                  if (errorCode === ErrorCode.RawFilesNotFound) {
                    message = (
                      <p>
                        <Trans>
                          Unable to generate the screenshot, make sure the game is fully loaded and you are in‑game.
                        </Trans>
                      </p>
                    );
                  }
                  showToast({
                    content: message,
                    type: 'error',
                  });
                }
                setIsLoading(false);
              }}
            >
              <Trans>Generate camera from in‑game view</Trans>
            </SpinnableButton>
          </div>
          <InputsRow>
            {nameInput}
            <CameraColorInput />
          </InputsRow>
          <InputsRow>
            <CoordinateXInput />
            <CoordinateYInput />
            <CoordinateZInput />
          </InputsRow>
          <InputsRow>
            <PitchInput />
            <YawInput />
          </InputsRow>
          <InputsRow>
            <CameraPreviewInput />
          </InputsRow>
          <FieldError error={error || fields.previewBase64.error} />
        </div>
      </DialogContent>
      <DialogFooter>
        <div className="mr-auto">
          <ExternalLink href="https://cs-demo-manager.com/docs/guides/cameras">
            <Trans>Documentation</Trans>
          </ExternalLink>
        </div>
        <SaveButton onClick={validateAndSubmit} />
        <CancelButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
