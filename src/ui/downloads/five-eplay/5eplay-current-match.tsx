import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ActionBar as CommonActionBar } from 'csdm/ui/components/action-bar';
import { WatchDemoButton } from 'csdm/ui/downloads/watch-demo-button';
import type { FiveEPlayDownload } from 'csdm/common/download/download-types';
import { DownloadSource } from 'csdm/common/download/download-types';
import { DownloadDemoButton } from '../download-demo-button';
import { RevealDemoInExplorerButton } from '../reveal-demo-in-explorer-button';
import { Button } from 'csdm/ui/components/buttons/button';
import { SeeDemoButton } from 'csdm/ui/downloads/see-demo-button';
import { CopyDemoLinkButton } from 'csdm/ui/components/buttons/copy-demo-link-button';
import { useCurrent5EPlayMatch } from './use-current-5eplay-match';
import { FiveEPlayMatch } from './5eplay-match';

function SeeOnWebsiteButton() {
  const match = useCurrent5EPlayMatch();
  const onClick = () => {
    window.open(match.url);
  };

  return (
    <Button onClick={onClick}>
      <Trans context="Button">See on 5EPlay</Trans>
    </Button>
  );
}

function DownloadButton() {
  const match = useCurrent5EPlayMatch();
  const download: FiveEPlayDownload = {
    game: match.game,
    demoUrl: match.demoUrl,
    fileName: match.id,
    matchId: match.id,
    source: DownloadSource['5EPlay'],
    match,
  };

  return <DownloadDemoButton status={match.downloadStatus} download={download} />;
}

function ActionBar() {
  const match = useCurrent5EPlayMatch();

  return (
    <CommonActionBar
      left={
        <>
          <DownloadButton />
          <RevealDemoInExplorerButton demoFileName={match.id} downloadStatus={match.downloadStatus} />
          <SeeDemoButton demoFileName={match.id} downloadStatus={match.downloadStatus} />
          <WatchDemoButton demoFileName={match.id} game={match.game} downloadStatus={match.downloadStatus} />
          {match.demoUrl && <CopyDemoLinkButton link={match.demoUrl} />}
          <SeeOnWebsiteButton />
        </>
      }
    />
  );
}

export function FiveEPlayCurrentMatch() {
  const match = useCurrent5EPlayMatch();

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <ActionBar />
      <FiveEPlayMatch match={match} />
    </div>
  );
}
