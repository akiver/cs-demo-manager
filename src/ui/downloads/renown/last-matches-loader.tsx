import React, { useEffect } from 'react';
import { Trans } from '@lingui/react/macro';
import { Status } from 'csdm/common/types/status';
import { Message } from 'csdm/ui/components/message';
import { DownloadsFolderRequired } from '../downloads-folder-required';
import { useDownloadFolderPath } from '../../settings/downloads/use-download-folder-path';
import { NoRenownAccount } from './no-renown-account';
import { ErrorCode } from 'csdm/common/error-code';
import { useFetchLastRenownMatches } from './use-fetch-last-renown-matches';
import { useRenownState } from './use-renown-state';
import { useCurrentRenownAccount } from './use-current-renown-account';
import { Sidebar } from './sidebar';
import { CurrentMatch } from './current-match';

export function LastMatchesLoader() {
  const fetchLastMatches = useFetchLastRenownMatches();
  const { status, errorCode, matches } = useRenownState();
  const currentAccount = useCurrentRenownAccount();
  const downloadFolderPath = useDownloadFolderPath();

  useEffect(() => {
    if (status === Status.Idle) {
      fetchLastMatches();
    }
  }, [status, fetchLastMatches]);

  if (!downloadFolderPath) {
    return <DownloadsFolderRequired />;
  }

  if (!currentAccount) {
    return <NoRenownAccount />;
  }

  if (status === Status.Loading) {
    return <Message message={<Trans>Fetching last matches…</Trans>} />;
  }

  if (status === Status.Error) {
    switch (errorCode) {
      case ErrorCode.RenownTooManyRequests:
        return <Message message={<Trans>Too many requests sent to the API.</Trans>} />;
      case ErrorCode.RenownInvalidRequest:
        return <Message message={<Trans>Invalid API request.</Trans>} />;
      case ErrorCode.RenownApiError:
        return <Message message={<Trans>The API returned an error, please re-try later.</Trans>} />;
      default:
        return <Message message={<Trans>An error occurred.</Trans>} />;
    }
  }

  if (matches.length === 0) {
    return <Message message={<Trans>No matches found for the current account.</Trans>} />;
  }

  return (
    <div className="flex overflow-hidden">
      <Sidebar />
      <CurrentMatch />
    </div>
  );
}
