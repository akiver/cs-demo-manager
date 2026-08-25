import React, { useEffect } from 'react';
import { Outlet, useParams } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useSelector } from 'csdm/ui/store/use-selector';
import { Status } from 'csdm/common/types/status';
import { Message } from 'csdm/ui/components/message';
import { fetchMatchError, fetchMatchStart, fetchMatchSuccess } from 'csdm/ui/match/match-actions';
import { RendererClientMessageName } from 'csdm/server/messages/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { ErrorCode } from 'csdm/common/error-code';
import { MatchTabs } from './match-tabs';
import { isErrorCode } from 'csdm/common/is-error-code';
import { useIsDemoAnalysisInProgress } from 'csdm/ui/analyses/use-is-demo-analysis-in-progress';

export function MatchLoader() {
  const client = useWebSocketClient();
  const { checksum } = useParams();
  const { match, status, errorCode } = useSelector((state) => state.match.entity);
  const isCurrentMatch = match?.checksum === checksum;
  const isDemoAnalysisInProgress = useIsDemoAnalysisInProgress();
  const dispatch = useDispatch();

  if (checksum === undefined) {
    throw new Error('Match checksum not provided in URL');
  }

  const isAnalysisInProgress = isDemoAnalysisInProgress(checksum);

  useEffect(() => {
    if (isCurrentMatch || isAnalysisInProgress) {
      return;
    }

    const fetchMatch = async () => {
      dispatch(fetchMatchStart());
      try {
        const match = await client.send({
          name: RendererClientMessageName.FetchMatchByChecksum,
          payload: checksum,
        });

        dispatch(fetchMatchSuccess({ match }));
      } catch (error) {
        dispatch(fetchMatchError({ errorCode: isErrorCode(error) ? error : ErrorCode.UnknownError }));
      }
    };

    void fetchMatch();
  }, [dispatch, client, checksum, isCurrentMatch, isAnalysisInProgress]);

  if (isAnalysisInProgress) {
    return <Message message={<Trans>Analyzing demo…</Trans>} />;
  }

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
