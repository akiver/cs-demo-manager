import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ActionBar as CommonActionBar } from 'csdm/ui/components/action-bar';
import { WatchDemoButton } from 'csdm/ui/downloads/watch-demo-button';
import type { RenownDownload } from 'csdm/common/download/download-types';
import { DownloadSource } from 'csdm/common/download/download-types';
import { DownloadDemoButton } from '../download-demo-button';
import { RevealDemoInExplorerButton } from '../reveal-demo-in-explorer-button';
import { SeeDemoButton } from 'csdm/ui/downloads/see-demo-button';
import { CopyDemoLinkButton } from 'csdm/ui/components/buttons/copy-demo-link-button';
import { useCurrentMatch } from './use-current-match';
import { Match } from './match';
import { OpenLinkButton } from 'csdm/ui/components/buttons/open-link-button';

function DownloadButton() {
  const match = useCurrentMatch();
  const download: RenownDownload = {
    game: match.game,
    demoUrl: match.demoUrl,
    fileName: match.id,
    matchId: match.id,
    source: DownloadSource.Renown,
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
          <OpenLinkButton url={match.url}>
            <Trans context="Button">See on Renown</Trans>
          </OpenLinkButton>
          {match.leetifyMatchUrl && (
            <OpenLinkButton url={match.leetifyMatchUrl}>
              <Trans context="Button">See on Leetify</Trans>
            </OpenLinkButton>
          )}
        </>
      }
    />
  );
}

export function CurrentMatch() {
  const match = useCurrentMatch();

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <ActionBar />
      <Match match={match} />
    </div>
  );
}
