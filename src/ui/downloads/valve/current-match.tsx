import React from 'react';
import { CopyShareCodeButton } from 'csdm/ui/components/buttons/copy-share-code-button';
import { WatchDemoButton } from 'csdm/ui/downloads/watch-demo-button';
import { ActionBar } from 'csdm/ui/components/action-bar';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import type { ValvePlayer } from 'csdm/common/types/valve-match';
import { ValveMatchOverview } from 'csdm/ui/components/valve-match/valve-match-overview';
import { useSelectedMatch } from './use-selected-match';
import { MatchDownloadDemoButton } from './download-demo-button';
import { steamIdSelected } from './valve-actions';
import { RevealDemoInExplorerButton } from '../reveal-demo-in-explorer-button';
import { SeeDemoButton } from '../see-demo-button';
import { useGetDownloadedDemoPath } from 'csdm/ui/downloads/use-get-downloaded-demo-path';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { useSelectedPlayer } from './use-selected-player';
import { CopyDemoLinkButton } from 'csdm/ui/components/buttons/copy-demo-link-button';

export function CurrentMatch() {
  const match = useSelectedMatch();
  const dispatch = useDispatch();
  const downloadedDemoPath = useGetDownloadedDemoPath(match.name);
  const demoPath = match.downloadStatus === DownloadStatus.Downloaded ? downloadedDemoPath : undefined;
  const selectedPlayer = useSelectedPlayer();

  const onPlayerSelected = (player: ValvePlayer) => {
    dispatch(
      steamIdSelected({
        steamId: player.steamId,
      }),
    );
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <ActionBar
        left={
          <>
            <MatchDownloadDemoButton />
            <RevealDemoInExplorerButton demoFileName={match.name} downloadStatus={match.downloadStatus} />
            <SeeDemoButton demoFileName={match.name} downloadStatus={match.downloadStatus} />
            <WatchDemoButton demoFileName={match.name} game={match.game} downloadStatus={match.downloadStatus} />
            {match.demoUrl && <CopyDemoLinkButton link={match.demoUrl} />}
            <CopyShareCodeButton shareCode={match.sharecode} />
          </>
        }
      />
      <div className="flex flex-col flex-1 overflow-auto p-16">
        <ValveMatchOverview
          match={match}
          demoPath={demoPath}
          selectedPlayer={selectedPlayer}
          onPlayerSelected={onPlayerSelected}
        />
      </div>
    </div>
  );
}
