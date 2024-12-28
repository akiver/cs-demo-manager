import React, { useEffect } from 'react';
import { Trans } from '@lingui/react/macro';
import { Status } from 'csdm/common/types/status';
import { Message } from 'csdm/ui/components/message';
import { useFetchLastFaceitMatches } from './use-fetch-last-faceit-matches';
import { useCurrentFaceitAccount } from './use-current-faceit-account';
import { DownloadsFolderRequired } from '../downloads-folder-required';
import { useDownloadFolderPath } from '../../settings/downloads/use-download-folder-path';
import { Sidebar } from './sidebar';
import { CurrentMatch } from './current-match';
import { NoFaceitAccount } from './no-faceit-account';
import { useFaceitState } from './use-faceit-state';
import { ErrorCode } from 'csdm/common/error-code';

export function LastMatchesLoader() {
  const fetchLastFaceitMatches = useFetchLastFaceitMatches();
  const { status, errorCode, matches } = useFaceitState();
  const currentAccount = useCurrentFaceitAccount();
  const downloadFolderPath = useDownloadFolderPath();

  useEffect(() => {
    if (status === Status.Idle) {
      fetchLastFaceitMatches();
    }
  }, [status, fetchLastFaceitMatches]);

  if (downloadFolderPath === undefined) {
    return <DownloadsFolderRequired />;
  }

  if (currentAccount === undefined) {
    return <NoFaceitAccount />;
  }

  if (status === Status.Loading) {
    return <Message message={<Trans>Fetching last matches…</Trans>} />;
  }

  if (status === Status.Error) {
    switch (errorCode) {
      case ErrorCode.FaceItApiForbidden:
        return <Message message={<Trans>The API returned a forbidden error, please check your API key.</Trans>} />;
      case ErrorCode.FaceItApiUnauthorized:
        return (
          <Message message={<Trans>The API returned an unauthorized status code, please check your API key.</Trans>} />
        );
      case ErrorCode.FaceItApiInvalidRequest:
        return <Message message={<Trans>Invalid API request.</Trans>} />;
      case ErrorCode.FaceItApiError:
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
