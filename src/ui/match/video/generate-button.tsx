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

export function GenerateButton() {
  const match = useCurrentMatch();
  const sequences = useCurrentMatchSequences();
  const { showDialog } = useDialog();
  const { settings } = useVideoSettings();
  const [isCheckingForCsStatus, setIsCheckingForCsStatus] = useState(false);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
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

  const onClick = async () => {
    setIsCheckingForCsStatus(true);
    const csIsRunning = await isCsRunning();
    if (csIsRunning) {
      showDialog(<CounterStrikeRunningDialog onConfirmClick={startVideosGeneration} />);
    } else {
      startVideosGeneration();
    }
    setIsCheckingForCsStatus(false);
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
