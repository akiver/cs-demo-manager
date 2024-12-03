import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ActionBar as CommonActionBar } from 'csdm/ui/components/action-bar';
import { WatchDemoButton } from 'csdm/ui/downloads/watch-demo-button';
import type { FaceitDownload } from 'csdm/common/download/download-types';
import { DownloadSource } from 'csdm/common/download/download-types';
import { DownloadDemoButton } from '../download-demo-button';
import { RevealDemoInExplorerButton } from '../reveal-demo-in-explorer-button';
import { Match } from './match';
import { useCurrentMatch } from './use-current-match';
import { Button } from 'csdm/ui/components/buttons/button';
import { SeeDemoButton } from 'csdm/ui/downloads/see-demo-button';
import { CopyDemoLinkButton } from 'csdm/ui/components/buttons/copy-demo-link-button';

function SeeOnFaceitButton() {
  const match = useCurrentMatch();
  const onClick = () => {
    window.open(match.url);
  };

  return (
    <Button onClick={onClick}>
      <Trans context="Button">See on FACEIT</Trans>
    </Button>
  );
}

function DownloadButton() {
  const match = useCurrentMatch();
  const download: FaceitDownload = {
    game: match.game,
    demoUrl: match.demoUrl,
    fileName: match.id,
    matchId: match.id,
    source: DownloadSource.Faceit,
    match,
  };

  return <DownloadDemoButton status={match.downloadStatus} download={download} />;
}

function ActionBar() {
  const match = useCurrentMatch();

  return (
    <CommonActionBar
      left={
        <>
          <DownloadButton />
          <RevealDemoInExplorerButton demoFileName={match.id} downloadStatus={match.downloadStatus} />
          <SeeDemoButton demoFileName={match.id} downloadStatus={match.downloadStatus} />
          <WatchDemoButton demoFileName={match.id} game={match.game} downloadStatus={match.downloadStatus} />
          {match.demoUrl && <CopyDemoLinkButton link={match.demoUrl} />}
          <SeeOnFaceitButton />
        </>
      }
    />
  );
}

export function CurrentMatch() {
  const match = useCurrentMatch();

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <ActionBar />
      <Match match={match} />
    </div>
  );
}
