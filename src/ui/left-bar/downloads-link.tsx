import React from 'react';
import { Trans } from '@lingui/react/macro';
import { DownloadIcon } from 'csdm/ui/icons/download-icon';
import { LeftBarLink } from './left-bar-link';
import { PendingDownloadsBadge } from './pending-downloads-badge';
import { RoutePath } from 'csdm/ui/routes-paths';

export function DownloadsLink() {
  return (
    <LeftBarLink
      icon={
        <div className="relative size-full">
          <PendingDownloadsBadge />
          <DownloadIcon />
        </div>
      }
      tooltip={<Trans context="Tooltip">Downloads</Trans>}
      url={RoutePath.Downloads}
    />
  );
}
