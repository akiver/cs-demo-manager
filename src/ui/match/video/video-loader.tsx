import React, { useEffect, useState, type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { usePathExists } from '../../hooks/use-path-exists';
import { MatchVideo } from './video';
import { UpdateDemoLocation } from './update-demo-location';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { Message } from 'csdm/ui/components/message';
import { initializeVideoSuccess } from './video-actions';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useCurrentMatch } from '../use-current-match';
import type { InitializeVideoPayload } from 'csdm/server/handlers/renderer-process/video/initialize-video-handler';
import { ErrorCode } from 'csdm/common/error-code';
import { isErrorCode } from 'csdm/common/is-error-code';

export function VideoLoader() {
  const client = useWebSocketClient();
  const match = useCurrentMatch();
  const [errorCode, setErrorCode] = useState<ErrorCode>();
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  const demoExists = usePathExists(match.demoFilePath);

  useEffect(() => {
    const initialize = async () => {
      try {
        const payload: InitializeVideoPayload = {
          demoFilePath: match.demoFilePath,
        };
        const result = await client.send({
          name: RendererClientMessageName.InitializeVideo,
          payload,
        });

        dispatch(initializeVideoSuccess(result));
        setIsReady(true);
      } catch (error) {
        const errorCode = isErrorCode(error) ? error : ErrorCode.UnknownError;
        setErrorCode(errorCode);
      }
    };

    initialize();
  }, [dispatch, client, match]);

  if (errorCode) {
    let message: ReactNode;
    switch (errorCode) {
      case ErrorCode.DemoNotFound:
        message = <Trans>Demo not found.</Trans>;
        break;
      case ErrorCode.CounterStrikeExecutableNotFound:
        message = <Trans>Counter-Strike executable not found.</Trans>;
        break;
      case ErrorCode.CustomCounterStrikeExecutableNotFound:
        message = <Trans>Counter-Strike executable not found, check your app playback settings.</Trans>;
        break;
      default:
        message = <Trans>An error occurred. (Code {errorCode})</Trans>;
    }

    return <Message message={message} />;
  }

  if (!isReady) {
    return <Message message={<Trans>Loading video generator…</Trans>} />;
  }

  if (!demoExists) {
    return <UpdateDemoLocation checksum={match.checksum} demoFilePath={match.demoFilePath} />;
  }

  return <MatchVideo />;
}
