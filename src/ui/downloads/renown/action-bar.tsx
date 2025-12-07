import React from 'react';
import { ActionBar as CommonActionBar } from 'csdm/ui/components/action-bar';
import { Status } from 'csdm/common/types/status';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { RefreshButton } from 'csdm/ui/components/buttons/refresh-button';
import { RevealDownloadFolderInExplorerButton } from '../reveal-download-folder-in-explorer-button';
import { useCurrentRenownAccount } from './use-current-renown-account';
import { Select } from 'csdm/ui/components/inputs/select';
import { DownloadDemosButton } from '../download-demos-button';
import { DownloadSource } from 'csdm/common/download/download-types';
import type { RenownDownload } from 'csdm/common/download/download-types';
import { useRenownAccounts } from './use-renown-accounts';
import { useUpdateCurrentRenownAccount } from './use-update-current-renown-account';
import { useRenownStatus } from './use-renown-status';
import { useFetchLastRenownMatches } from './use-fetch-last-renown-matches';
import { useRenownMatches } from './use-renown-matches';

function AccountSelect() {
  const status = useRenownStatus();
  const isDisabled = status === Status.Loading || status === Status.Idle;
  const accounts = useRenownAccounts();
  const currentAccount = useCurrentRenownAccount();
  const updateCurrentRenownAccount = useUpdateCurrentRenownAccount();
  const options: SelectOption[] = accounts.map((account) => {
    return {
      value: account.id,
      label: account.nickname,
    };
  });

  const onChange = async (accountId: string) => {
    await updateCurrentRenownAccount(accountId);
  };

  if (accounts.length === 0) {
    return null;
  }

  return <Select options={options} value={currentAccount?.id} onChange={onChange} isDisabled={isDisabled} />;
}

function RefreshMatchesButton() {
  const fetchLastRenownMatches = useFetchLastRenownMatches();
  const status = useRenownStatus();
  const isDisabled = status === Status.Loading || status === Status.Idle;

  return <RefreshButton onClick={fetchLastRenownMatches} isDisabled={isDisabled} />;
}

function DownloadAllButton() {
  const matches = useRenownMatches();
  const status = useRenownStatus();
  const downloads: RenownDownload[] = matches.map((match) => {
    return {
      matchId: match.id,
      game: match.game,
      demoUrl: match.demoUrl,
      fileName: match.id,
      match: match,
      source: DownloadSource.Renown,
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
