import React from 'react';
import { WatchButton } from 'csdm/ui/components/buttons/watch-button';
import { useGetDownloadedDemoPath } from 'csdm/ui/downloads/use-get-downloaded-demo-path';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { DownloadRequiredTooltip } from './dowload-required-tooltip';
import type { Game } from 'csdm/common/types/counter-strike';
import { isCounterStrikeStartable } from 'csdm/ui/hooks/use-counter-strike';

type Props = {
  demoFileName: string;
  downloadStatus: DownloadStatus;
  game: Game;
};

export function WatchDemoButton({ game, demoFileName, downloadStatus }: Props) {
  const demoPath = useGetDownloadedDemoPath(demoFileName);
  const isDisabled = downloadStatus !== DownloadStatus.Downloaded;

  if (!isCounterStrikeStartable(game)) {
    return null;
  }

  if (isDisabled) {
    return (
      <DownloadRequiredTooltip>
        <WatchButton demoPath={demoPath} isDisabled={isDisabled} game={game} />
      </DownloadRequiredTooltip>
    );
  }

  return <WatchButton demoPath={demoPath} isDisabled={isDisabled} game={game} />;
}
