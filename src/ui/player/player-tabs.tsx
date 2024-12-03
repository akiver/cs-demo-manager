import React from 'react';
import { Trans } from '@lingui/react/macro';
import { TabLinks } from 'csdm/ui/components/tabs/tab-links';
import { TabLink } from 'csdm/ui/components/tabs/tab-link';
import { RoutePath } from 'csdm/ui/routes-paths';

export function PlayerTabs() {
  return (
    <TabLinks>
      <TabLink url="">
        <Trans context="Tab link">Overview</Trans>
      </TabLink>
      <TabLink url={RoutePath.PlayerCharts}>
        <Trans context="Tab link">Graphs</Trans>
      </TabLink>
      <TabLink url={RoutePath.PlayerMaps}>
        <Trans context="Tab link">Maps</Trans>
      </TabLink>
      <TabLink url={RoutePath.PlayerRank}>
        <Trans context="Tab link">Rank</Trans>
      </TabLink>
      <TabLink url={RoutePath.PlayerMatches}>
        <Trans context="Tab link">Matches</Trans>
      </TabLink>
    </TabLinks>
  );
}
