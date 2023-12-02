import React from 'react';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { ActionBar as CommonActionBar } from 'csdm/ui/components/action-bar';
import { RefreshButton } from 'csdm/ui/components/buttons/refresh-button';
import { CounterStrikeRunningDialog } from 'csdm/ui/components/dialogs/counter-strike-running-dialog';
import { Status } from 'csdm/common/types/status';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { RevealDownloadFolderInExplorerButton } from '../reveal-download-folder-in-explorer-button';
import { DownloadDemoFromShareCodeButton } from '../download-demo-from-share-code-button';
import { useMatches } from './use-matches';
import { useStatus } from './use-status';
import { buildDownloadFromValveMatch } from '../../../common/download/build-download-from-valve-match';
import { DownloadDemosButton } from '../download-demos-button';
import { useIsCsRunning } from 'csdm/ui/hooks/use-is-cs-running';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';

function RefreshMatchesButton() {
  const client = useWebSocketClient();
  const isDisabled = useStatus() === Status.Loading;
  const isCsRunning = useIsCsRunning();
  const { showDialog } = useDialog();

  const fetchLastMatches = () => {
    client.send({
      name: RendererClientMessageName.FetchLastValveMatches,
    });
  };

  const onClick = async () => {
    const csIsRunning = await isCsRunning();
    if (csIsRunning) {
      showDialog(<CounterStrikeRunningDialog onConfirmClick={fetchLastMatches} />);
    } else {
      fetchLastMatches();
    }
  };

  return <RefreshButton onClick={onClick} isDisabled={isDisabled} />;
}

function DownloadAllButton() {
  const matches = useMatches();
  const status = useStatus();
  const downloads = matches.map((match) => {
    return buildDownloadFromValveMatch(match);
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
          <DownloadDemoFromShareCodeButton />
        </>
      }
    />
  );
}
