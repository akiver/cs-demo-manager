import React, { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { Status } from 'csdm/common/types/status';
import { Message } from 'csdm/ui/components/message';
import { fetchMatchSuccess } from 'csdm/ui/match/match-actions';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useUnsafeCurrentMatch } from './use-unsafe-current-match';
import { ErrorCode } from 'csdm/common/error-code';
import { MatchTabs } from './match-tabs';
import { isErrorCode } from 'csdm/common/is-error-code';

export function MatchLoader() {
  const client = useWebSocketClient();
  const { checksum } = useParams();
  const match = useUnsafeCurrentMatch();
  const isCurrentMatch = match?.checksum === checksum;
  const [status, setStatus] = useState<Status>(isCurrentMatch ? Status.Success : Status.Loading);
  const [errorCode, setErrorCode] = useState<ErrorCode>(ErrorCode.UnknownError);
  const dispatch = useDispatch();

  if (checksum === undefined) {
    throw new Error('Match checksum not provided in URL');
  }

  useEffect(() => {
    if (isCurrentMatch) {
      return;
    }

    const fetchMatch = async () => {
      try {
        const match = await client.send({
          name: RendererClientMessageName.FetchMatchByChecksum,
          payload: checksum,
        });

        dispatch(fetchMatchSuccess({ match }));
        setStatus(Status.Success);
      } catch (error) {
        if (isErrorCode(error)) {
          setErrorCode(error);
        }
        setStatus(Status.Error);
      }
    };
    fetchMatch();
  }, [dispatch, client, checksum, isCurrentMatch]);

  if (status === Status.Loading) {
    return <Message message={<Trans>Fetching match…</Trans>} />;
  }

  if (status === Status.Error) {
    const message =
      errorCode === ErrorCode.MatchNotFound ? <Trans>Match not found.</Trans> : <Trans>An error occurred.</Trans>;

    return <Message message={message} />;
  }

  return (
    <>
      <MatchTabs />
      <Outlet />
    </>
  );
}
