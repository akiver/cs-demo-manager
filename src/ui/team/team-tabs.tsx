import React from 'react';
import { Trans } from '@lingui/react/macro';
import { TabLinks } from 'csdm/ui/components/tabs/tab-links';
import { TabLink } from 'csdm/ui/components/tabs/tab-link';
import { RoutePath } from 'csdm/ui/routes-paths';

export function TeamTabs() {
  return (
    <TabLinks>
      <TabLink url="">
        <Trans context="Tab link">Overview</Trans>
      </TabLink>
      <TabLink url={RoutePath.TeamMaps}>
        <Trans context="Tab link">Maps</Trans>
      </TabLink>
      <TabLink url={RoutePath.TeamHeatmap}>
        <Trans context="Tab link">Heatmap</Trans>
      </TabLink>
      <TabLink url={RoutePath.TeamPerformance}>
        <Trans context="Tab link">Performance</Trans>
      </TabLink>
      <TabLink url={RoutePath.TeamMatches}>
        <Trans context="Tab link">Matches</Trans>
      </TabLink>
    </TabLinks>
  );
}
