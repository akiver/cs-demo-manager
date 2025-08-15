import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Status } from 'csdm/common/types/status';
import { Message } from 'csdm/ui/components/message';
import { FetchMatchesConfirmation } from 'csdm/ui/downloads/valve/fetch-matches-confirmation';
import { useMatches } from './use-matches';
import { useStatus } from './use-status';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { LastMatches } from './last-matches';
import { FetchMatchesInfoError } from './fetch-matches-error';
import { NoMatchesFound } from './no-matches-found';
import { DownloadsFolderRequired } from 'csdm/ui/downloads/downloads-folder-required';
import { useErrorCode } from './use-error-code';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDownloadFolderPath } from 'csdm/ui/settings/downloads/use-download-folder-path';
import { useGetBoilerErrorMessageFromErrorCode } from 'csdm/ui/downloads/use-get-boiler-error-message-from-error-code';

export function LastMatchesLoader() {
  const client = useWebSocketClient();
  const matches = useMatches();
  const status: Status = useStatus();
  const errorCode = useErrorCode();
  const downloadFolderPath = useDownloadFolderPath();
  const getBoilerErrorMessageFromErrorCode = useGetBoilerErrorMessageFromErrorCode();
  const { t } = useLingui();

  const fetchLastMatches = () => {
    client.send({
      name: RendererClientMessageName.FetchLastValveMatches,
    });
  };

  if (downloadFolderPath === undefined) {
    return <DownloadsFolderRequired />;
  }

  if (status === Status.Idle) {
    return <FetchMatchesConfirmation onContinueClick={fetchLastMatches} />;
  }

  if (status === Status.Loading) {
    return <Message message={<Trans>Fetching last matches…</Trans>} />;
  }

  if (status === Status.Error) {
    let errorMessage = t`An error occurred.`;
    if (errorCode !== undefined) {
      errorMessage = getBoilerErrorMessageFromErrorCode(errorMessage, errorCode);
    }
    return <FetchMatchesInfoError error={errorMessage} onRetryClick={fetchLastMatches} />;
  }

  if (matches.length === 0) {
    return <NoMatchesFound onRetryClick={fetchLastMatches} />;
  }

  return <LastMatches />;
}
