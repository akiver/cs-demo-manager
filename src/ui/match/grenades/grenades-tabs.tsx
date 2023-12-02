import React from 'react';
import { Trans } from '@lingui/macro';
import { TabLinks } from 'csdm/ui/components/tabs/tab-links';
import { TabLink } from 'csdm/ui/components/tabs/tab-link';
import { RoutePath } from 'csdm/ui/routes-paths';

export function GrenadesTabs() {
  return (
    <TabLinks>
      <TabLink url="" text={<Trans context="Tab link">Stats</Trans>} />
      <TabLink url={RoutePath.MatchGrenadesFinder} text={<Trans context="Tab link grenades finder">Finder</Trans>} />
    </TabLinks>
  );
}
