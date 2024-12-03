import React from 'react';
import { Trans } from '@lingui/react/macro';
import { RoutePath } from 'csdm/ui/routes-paths';
import { PendingIcon } from 'csdm/ui/icons/pending-icon';
import { LeftBarLink } from './left-bar-link';
import { PendingAnalysesBadge } from './pending-analyses-badge';

export function AnalysesLink() {
  return (
    <LeftBarLink
      icon={
        <div className="relative size-full">
          <PendingAnalysesBadge />
          <PendingIcon />
        </div>
      }
      tooltip={<Trans context="Tooltip">Analyses</Trans>}
      url={RoutePath.Analyses}
    />
  );
}
