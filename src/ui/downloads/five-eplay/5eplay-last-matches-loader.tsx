import React, { useEffect } from 'react';
import { Trans } from '@lingui/react/macro';
import { Status } from 'csdm/common/types/status';
import { Message } from 'csdm/ui/components/message';
import { DownloadsFolderRequired } from '../downloads-folder-required';
import { useDownloadFolderPath } from '../../settings/downloads/use-download-folder-path';
import { ErrorCode } from 'csdm/common/error-code';
import { use5EPlayState } from './use-5eplay-state';
import { useFetchLast5EPlayMatches } from './use-fetch-last-5eplay-matches';
import { useCurrent5EPlayAccount } from './use-current-5eplay-account';
import { No5EPlayAccount } from './no-5eplay-account';
import { FiveEPlayDownloadSidebar } from './5eplay-download-sidebar';
import { FiveEPlayCurrentMatch } from './5eplay-current-match';

export function FiveEPlayLastMatchesLoader() {
  const fetchLastMatches = useFetchLast5EPlayMatches();
  const { status, errorCode, matches } = use5EPlayState();
  const currentAccount = useCurrent5EPlayAccount();
  const downloadFolderPath = useDownloadFolderPath();

  useEffect(() => {
    if (status === Status.Idle) {
      fetchLastMatches();
    }
  }, [status, fetchLastMatches]);

  if (downloadFolderPath === undefined) {
    return <DownloadsFolderRequired />;
  }

  if (currentAccount === undefined) {
    return <No5EPlayAccount />;
  }

  if (status === Status.Loading) {
    return <Message message={<Trans>Fetching last matches…</Trans>} />;
  }

  if (status === Status.Error) {
    switch (errorCode) {
      case ErrorCode.FiveEPlayApiInvalidRequest:
        return <Message message={<Trans>Invalid request.</Trans>} />;
      case ErrorCode.FiveEPlayApiError:
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
      <FiveEPlayDownloadSidebar />
      <FiveEPlayCurrentMatch />
    </div>
  );
}
