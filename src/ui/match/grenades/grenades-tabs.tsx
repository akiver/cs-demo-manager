import React from 'react';
import { Trans } from '@lingui/react/macro';
import { TabLinks } from 'csdm/ui/components/tabs/tab-links';
import { TabLink } from 'csdm/ui/components/tabs/tab-link';
import { RoutePath } from 'csdm/ui/routes-paths';

export function GrenadesTabs() {
  return (
    <TabLinks>
      <TabLink url="">
        <Trans context="Tab link">Stats</Trans>
      </TabLink>
      <TabLink url={RoutePath.MatchGrenadesFinder}>
        <Trans context="Tab link grenades finder">Finder</Trans>
      </TabLink>
    </TabLinks>
  );
}
