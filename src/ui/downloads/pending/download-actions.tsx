import React from 'react';
import { Trans } from '@lingui/react/macro';
import { SeeDemoButton } from 'csdm/ui/downloads/see-demo-button';
import { CheckCircleIcon } from 'csdm/ui/icons/check-circle-icon';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { ExpiredIcon as ClockIcon } from 'csdm/ui/icons/expired-icon';
import { PendingIcon } from 'csdm/ui/icons/pending-icon';
import { Progress } from 'csdm/ui/components/progress';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { useDownloadProgress } from './use-download-progress';
import { useDownloadStatus } from './use-download-status';
import { RemoveDownloadButton } from './remove-download-button';
import { RevealDemoInExplorerButton } from 'csdm/ui/downloads/reveal-demo-in-explorer-button';
import { FileCorruptedIcon } from 'csdm/ui/icons/file-corrupted-icon';

type Props = {
  matchId: string;
  demoFileName: string;
};

export function DownloadActions({ matchId, demoFileName }: Props) {
  const progress: { [matchId: string]: number } = useDownloadProgress();
  const matchProgress = progress[matchId] ?? 0;
  const statusPerMatchId: { [matchId: string]: DownloadStatus } = useDownloadStatus();
  const status: DownloadStatus = statusPerMatchId[matchId] || DownloadStatus.NotDownloaded;
  let statusIcon: React.ReactNode | null = null;
  let bottomContent: React.ReactNode | null = null;

  switch (status) {
    case DownloadStatus.Downloading:
      bottomContent = <Progress value={matchProgress * 100} />;
      break;
    case DownloadStatus.Downloaded:
      statusIcon = <CheckCircleIcon className="w-16 text-green-400" />;
      bottomContent = (
        <div className="flex gap-4">
          <SeeDemoButton demoFileName={demoFileName} downloadStatus={status} />
          <RevealDemoInExplorerButton demoFileName={demoFileName} downloadStatus={status} />
        </div>
      );
      break;
    case DownloadStatus.Expired:
      statusIcon = <ClockIcon className="w-16 text-orange-400" />;
      bottomContent = (
        <p>
          <Trans>The download link has expired.</Trans>
        </p>
      );
      break;
    case DownloadStatus.Corrupted:
      statusIcon = <FileCorruptedIcon className="w-16 text-orange-400" />;
      bottomContent = (
        <p>
          <Trans>The downloaded demo is corrupted. You can retry later.</Trans>
        </p>
      );
      break;
    case DownloadStatus.Error:
      statusIcon = <ExclamationTriangleIcon className="w-16 text-red-400" />;
      bottomContent = (
        <p>
          <Trans>An error occurred while downloading the demo.</Trans>
        </p>
      );
      break;
    default:
      statusIcon = <PendingIcon className="w-16 text-gray-900" />;
  }

  return (
    <div className="flex flex-col flex-1 items-end justify-between h-full">
      <div className="flex items-center gap-4">
        {statusIcon}
        <RemoveDownloadButton matchId={matchId} />
      </div>
      {bottomContent}
    </div>
  );
}
