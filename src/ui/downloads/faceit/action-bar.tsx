import React from 'react';
import { ActionBar as CommonActionBar } from 'csdm/ui/components/action-bar';
import { Status } from 'csdm/common/types/status';
import type { FaceitMatch } from 'csdm/common/types/faceit-match';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { RefreshButton } from 'csdm/ui/components/buttons/refresh-button';
import { RevealDownloadFolderInExplorerButton } from '../reveal-download-folder-in-explorer-button';
import { useCurrentFaceitAccount } from './use-current-faceit-account';
import { useFaceitAccounts } from './use-faceit-accounts';
import { Select } from 'csdm/ui/components/inputs/select';
import { useUpdateCurrentFaceitAccount } from './use-update-current-faceit-account';
import { DownloadDemosButton } from '../download-demos-button';
import { DownloadSource } from 'csdm/common/download/download-types';
import type { FaceitDownload } from 'csdm/common/download/download-types';
import { useFaceitMatches } from './use-faceit-matches';
import { useFetchLastFaceitMatches } from './use-fetch-last-faceit-matches';
import { useFaceitStatus } from './use-faceit-status';

function AccountSelect() {
  const status = useFaceitStatus();
  const isDisabled = status === Status.Loading || status === Status.Idle;
  const accounts = useFaceitAccounts();
  const currentAccount = useCurrentFaceitAccount();
  const updateCurrentFaceitAccount = useUpdateCurrentFaceitAccount();
  const options: SelectOption[] = accounts.map((account) => {
    return {
      value: account.id,
      label: account.nickname,
    };
  });

  const onChange = async (accountId: string) => {
    await updateCurrentFaceitAccount(accountId);
  };

  if (accounts.length === 0) {
    return null;
  }

  return <Select options={options} value={currentAccount?.id} onChange={onChange} isDisabled={isDisabled} />;
}

function RefreshMatchesButton() {
  const fetchLastFaceitMatches = useFetchLastFaceitMatches();
  const status = useFaceitStatus();
  const isDisabled = status === Status.Loading || status === Status.Idle;

  return <RefreshButton onClick={fetchLastFaceitMatches} isDisabled={isDisabled} />;
}

function DownloadAllButton() {
  const matches: FaceitMatch[] = useFaceitMatches();
  const status = useFaceitStatus();
  const downloads: FaceitDownload[] = matches.map((match) => {
    return {
      demoUrl: match.demoUrl,
      fileName: match.id,
      game: match.game,
      match: match,
      matchId: match.id,
      source: DownloadSource.Faceit,
    };
  });

  return <DownloadDemosButton downloads={downloads} loadingStatus={status} />;
}

export function ActionBar() {
  return (
    <CommonActionBar
      left={
        <>
          <RefreshMatchesButton />
          <DownloadAllButton />
          <RevealDownloadFolderInExplorerButton />
          <AccountSelect />
        </>
      }
    />
  );
}
