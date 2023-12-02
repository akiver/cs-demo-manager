import React from 'react';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { Spinner } from 'csdm/ui/components/spinner';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { ExpiredIcon } from 'csdm/ui/icons/expired-icon';
import { DownloadIcon } from 'csdm/ui/icons/download-icon';
import { CheckCircleIcon } from 'csdm/ui/icons/check-circle-icon';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';

type Props = {
  status: DownloadStatus;
};

export function MatchDownloadStatus({ status }: Props) {
  const iconSize = 16;

  switch (status) {
    case DownloadStatus.Error:
      return (
        <Tooltip content="Error on download">
          <ExclamationTriangleIcon width={iconSize} className="text-red-400" />
        </Tooltip>
      );
    case DownloadStatus.NotDownloaded:
      return (
        <Tooltip content="Not downloaded">
          <DownloadIcon width={iconSize} className="text-orange-400" />
        </Tooltip>
      );
    case DownloadStatus.Downloading:
      return (
        <Tooltip content="Downloading...">
          <Spinner size={iconSize} />
        </Tooltip>
      );
    case DownloadStatus.Expired:
      return (
        <Tooltip content="Expired">
          <ExpiredIcon width={iconSize} className="text-orange-400" />
        </Tooltip>
      );
    default:
      return (
        <Tooltip content="Downloaded">
          <CheckCircleIcon width={iconSize} className="text-green-400" />
        </Tooltip>
      );
  }
}
