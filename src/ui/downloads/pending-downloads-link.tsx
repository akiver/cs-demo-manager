import React from 'react';
import { Trans } from '@lingui/macro';
import { RoutePath } from 'csdm/ui/routes-paths';
import { NumberBadge } from 'csdm/ui/components/number-badge';
import { TabLink } from 'csdm/ui/components/tabs/tab-link';
import { usePendingDownloadCount } from './pending/use-pending-download-count';

export function PendingDownloadsLink() {
  const pendingDownloadCount = usePendingDownloadCount();

  return (
    <div className="relative">
      <TabLink url={RoutePath.DownloadsPending} text={<Trans context="Link">Pending downloads</Trans>} />
      <div className="absolute top-0 -right-4">
        <NumberBadge number={pendingDownloadCount} />
      </div>
    </div>
  );
}
