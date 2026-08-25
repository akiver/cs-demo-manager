import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { Demo } from 'csdm/ui/demo/demo';
import { Status } from 'csdm/common/types/status';
import { Message } from 'csdm/ui/components/message';
import { RendererClientMessageName } from 'csdm/server/messages/renderer-client-message-name';
import { ErrorCode } from 'csdm/common/error-code';
import { UpdateDemoLocation } from 'csdm/ui/match/video/update-demo-location';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { loadDemoError, loadDemoStart, loadDemoSuccess } from './demo-actions';
import { useDemoState } from './use-demo-state';
import { isErrorCode } from 'csdm/common/is-error-code';
import { useNavigateToDemo } from 'csdm/ui/hooks/use-navigate-to-demo';

type LocationState = {
  state: null | {
    checksum: string;
  };
};

export function DemoLoader() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const params = useParams<'path'>();
  const demoPath = decodeURIComponent(params.path as string);
  const location = useLocation() as LocationState;
  const { demo, status, errorCode } = useDemoState();
  const isCurrentDemo = demo?.filePath === demoPath;
  const navigateToDemo = useNavigateToDemo();

  useEffect(() => {
    if (isCurrentDemo) {
      return;
    }

    const loadDemo = async () => {
      dispatch(loadDemoStart());
      try {
        const demo = await client.send({
          name: RendererClientMessageName.LoadDemoByPath,
          payload: demoPath,
        });

        dispatch(loadDemoSuccess(demo));
      } catch (error) {
        dispatch(loadDemoError({ errorCode: isErrorCode(error) ? error : ErrorCode.UnknownError }));
      }
    };

    void loadDemo();
  }, [client, dispatch, demoPath, isCurrentDemo]);

  if (status === Status.Loading) {
    return <Message message={<Trans>Loading demo…</Trans>} />;
  }

  if (status === Status.Error) {
    if (errorCode === ErrorCode.DemoNotFound) {
      if (location.state?.checksum !== undefined) {
        return (
          <UpdateDemoLocation
            demoFilePath={demoPath}
            checksum={location.state.checksum}
            onUpdated={async (demoPath) => {
              await navigateToDemo(demoPath);
            }}
          />
        );
      }

      return <Message message={<Trans>Demo not found.</Trans>} />;
    }

    return <Message message={<Trans>An error occurred while loading demo.</Trans>} />;
  }

  return <Demo />;
}
