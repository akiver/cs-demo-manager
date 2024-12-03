import React from 'react';
import { Trans } from '@lingui/react/macro';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { Spinner } from 'csdm/ui/components/spinner';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { ExpiredIcon } from 'csdm/ui/icons/expired-icon';
import { DownloadIcon } from 'csdm/ui/icons/download-icon';
import { CheckCircleIcon } from 'csdm/ui/icons/check-circle-icon';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { FileCorruptedIcon } from 'csdm/ui/icons/file-corrupted-icon';

type Props = {
  status: DownloadStatus;
};

export function MatchDownloadStatus({ status }: Props) {
  const iconSize = 16;

  switch (status) {
    case DownloadStatus.Error:
      return (
        <Tooltip content={<Trans context="Download status">Error on download</Trans>}>
          <ExclamationTriangleIcon width={iconSize} className="text-red-400" />
        </Tooltip>
      );
    case DownloadStatus.NotDownloaded:
      return (
        <Tooltip content={<Trans context="Download status">Not downloaded</Trans>}>
          <DownloadIcon width={iconSize} className="text-orange-400" />
        </Tooltip>
      );
    case DownloadStatus.Downloading:
      return (
        <Tooltip content={<Trans context="Download status">Downloading…</Trans>}>
          <Spinner size={iconSize} />
        </Tooltip>
      );
    case DownloadStatus.Expired:
      return (
        <Tooltip content={<Trans context="Download status">Expired</Trans>}>
          <ExpiredIcon width={iconSize} className="text-orange-400" />
        </Tooltip>
      );
    case DownloadStatus.Corrupted:
      return (
        <Tooltip content={<Trans context="Download status">Corrupted</Trans>}>
          <FileCorruptedIcon width={iconSize} className="text-orange-400" />
        </Tooltip>
      );
    default:
      return (
        <Tooltip content={<Trans context="Download status">Downloaded</Trans>}>
          <CheckCircleIcon width={iconSize} className="text-green-400" />
        </Tooltip>
      );
  }
}
