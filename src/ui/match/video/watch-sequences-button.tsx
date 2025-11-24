import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { useCurrentMatchSequences } from './sequences/use-current-match-sequences';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { useCurrentMatch } from '../use-current-match';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { WatchVideoSequencesPayload } from 'csdm/common/types/video';
import { isErrorCode } from 'csdm/common/is-error-code';
import { ErrorCode } from 'csdm/common/error-code';
import { getPlaybackErrorMessageFromErrorCode } from 'csdm/ui/shared/get-playback-error-from-error-code';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';

export function WatchSequencesButton() {
  const match = useCurrentMatch();
  const sequences = useCurrentMatchSequences();
  const showToast = useShowToast();
  const { settings } = useVideoSettings();
  const client = useWebSocketClient();

  const onClick = async () => {
    try {
      const payload: WatchVideoSequencesPayload = {
        ...settings,
        checksum: match.checksum,
        game: match.game,
        tickrate: match.tickrate,
        demoPath: match.demoFilePath,
        mapName: match.mapName,
        sequences,
      };
      await client.send({
        name: RendererClientMessageName.WatchVideoSequences,
        payload,
      });
    } catch (error) {
      const errorCode = isErrorCode(error) ? error : ErrorCode.UnknownError;
      const message = getPlaybackErrorMessageFromErrorCode(match.game, errorCode);
      showToast({
        type: 'error',
        content: message,
      });
    }
  };

  const isDisabled = sequences.length === 0;

  return (
    <Button onClick={onClick} isDisabled={isDisabled}>
      <Trans context="Button">Watch sequences</Trans>
    </Button>
  );
}
