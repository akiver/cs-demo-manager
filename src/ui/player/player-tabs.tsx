import React from 'react';
import { Trans } from '@lingui/macro';
import { TabLinks } from 'csdm/ui/components/tabs/tab-links';
import { TabLink } from 'csdm/ui/components/tabs/tab-link';
import { RoutePath } from 'csdm/ui/routes-paths';

export function PlayerTabs() {
  return (
    <TabLinks>
      <TabLink url="" text={<Trans context="Tab link">Overview</Trans>} />
      <TabLink url={RoutePath.PlayerCharts} text={<Trans context="Tab link">Graphs</Trans>} />
      <TabLink url={RoutePath.PlayerMaps} text={<Trans context="Tab link">Maps</Trans>} />
      <TabLink url={RoutePath.PlayerRank} text={<Trans context="Tab link">Rank</Trans>} />
      <TabLink url={RoutePath.PlayerMatches} text={<Trans context="Tab link">Matches</Trans>} />
    </TabLinks>
  );
}
