import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Trans } from '@lingui/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useCurrentMatchSequences } from './sequences/use-current-match-sequences';
import { CounterStrikeRunningDialog } from 'csdm/ui/components/dialogs/counter-strike-running-dialog';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { useCurrentMatch } from '../use-current-match';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { GeneratingVideosDialog } from './generating-dialog';
import { useIsCsRunning } from 'csdm/ui/hooks/use-is-cs-running';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { FullScreenDialog } from 'csdm/ui/dialogs/full-screen-dialog';
import type { GenerateVideosPayload } from 'csdm/server/handlers/renderer-process/video/generate-videos-handler';
import { useSequencesRequiredDiskSpace } from './sequences/use-sequences-required-disk-space';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { Game } from 'csdm/common/types/counter-strike';

export function GenerateButton() {
  const match = useCurrentMatch();
  const sequences = useCurrentMatchSequences();
  const { showDialog } = useDialog();
  const { settings } = useVideoSettings();
  const [isCheckingForCsStatus, setIsCheckingForCsStatus] = useState(false);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
  const requiredDiskSpace = useSequencesRequiredDiskSpace();
  const client = useWebSocketClient();
  const isCsRunning = useIsCsRunning();

  const startVideosGeneration = () => {
    const payload: GenerateVideosPayload = {
      ...settings,
      game: match.game,
      tickrate: match.tickrate,
      demoPath: match.demoFilePath,
      sequences,
    };
    setIsGeneratingVideos(true);
    client.send({
      name: RendererClientMessageName.GenerateVideos,
      payload,
    });
  };

  const onClick = () => {
    const tryStartGeneration = async () => {
      setIsCheckingForCsStatus(true);
      const csIsRunning = await isCsRunning();
      if (csIsRunning) {
        showDialog(<CounterStrikeRunningDialog onConfirmClick={startVideosGeneration} />);
      } else {
        startVideosGeneration();
      }
      setIsCheckingForCsStatus(false);
    };

    if (requiredDiskSpace > 40) {
      showDialog(
        <ConfirmDialog title={<Trans>Disk space warning</Trans>} onConfirm={tryStartGeneration}>
          <p>
            {match.game === Game.CSGO ? (
              <Trans>
                You will need at least <strong>{requiredDiskSpace}GB</strong> of free disk space to generate the videos.
              </Trans>
            ) : (
              <Trans>
                You will need at least <strong>{requiredDiskSpace}GB</strong> of free disk space on the disk where CS2
                is installed to generate the videos.
              </Trans>
            )}
          </p>
          <p>
            <Trans>Are you sure you want to continue?</Trans>
          </p>
        </ConfirmDialog>,
      );
    } else {
      tryStartGeneration();
    }
  };

  const isDisabled = sequences.length === 0 || isCheckingForCsStatus;

  return (
    <>
      <Button variant={ButtonVariant.Primary} onClick={onClick} isDisabled={isDisabled}>
        <Trans context="Button">Generate</Trans>
      </Button>

      {ReactDOM.createPortal(
        <FullScreenDialog isVisible={isGeneratingVideos}>
          <GeneratingVideosDialog closeDialog={() => setIsGeneratingVideos(false)} />
        </FullScreenDialog>,
        document.body,
      )}
    </>
  );
}
