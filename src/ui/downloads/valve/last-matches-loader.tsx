import React, { useCallback } from 'react';
import { Trans, msg } from '@lingui/macro';
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
import { useI18n } from 'csdm/ui/hooks/use-i18n';
import { CenteredContent } from 'csdm/ui/components/content';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { ExternalLink } from 'csdm/ui/components/external-link';

export function LastMatchesLoader() {
  return (
    <CenteredContent>
      <div className="flex flex-col items-center max-w-6xl">
        <ExclamationTriangleIcon className="size-32 text-red-700" />
        <div className="flex flex-col gap-y-8">
          <p className="text-title">
            <Trans>
              The CS:GO Steam game coordinator was shut down in the last major CS2 update, preventing us from retrieving
              your last CS2 MM matches.
            </Trans>
          </p>
          <p className="text-subtitle">
            <Trans>Downloading demos is currently unavailable and will be back as soon as possible.</Trans>
          </p>
          <p className="text-subtitle">
            <Trans>
              You can follow this{' '}
              <ExternalLink href="https://github.com/akiver/cs-demo-manager/issues/753">issue</ExternalLink> on GitHub
              to get updates.
            </Trans>
          </p>
        </div>
      </div>
    </CenteredContent>
  );
}

// TODO notImplemented Revert when downloading demos is back
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LastMatchesLoaderTmp() {
  const client = useWebSocketClient();
  const matches = useMatches();
  const status: Status = useStatus();
  const errorCode = useErrorCode();
  const downloadFolderPath = useDownloadFolderPath();
  const getBoilerErrorMessageFromErrorCode = useGetBoilerErrorMessageFromErrorCode();
  const _ = useI18n();

  const fetchLastMatches = useCallback(() => {
    client.send({
      name: RendererClientMessageName.FetchLastValveMatches,
    });
  }, [client]);

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
    let errorMessage = _(msg`An error occurred.`);
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
