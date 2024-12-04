import React from 'react';
import { Outlet } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { TabLinks } from 'csdm/ui/components/tabs/tab-links';
import { TabLink } from 'csdm/ui/components/tabs/tab-link';
import { RoutePath } from 'csdm/ui/routes-paths';

export function MatchDuels() {
  return (
    <>
      <TabLinks>
        <TabLink url="">
          <Trans context="Tab link">Duels matrix</Trans>
        </TabLink>
        <TabLink url={RoutePath.MatchOpeningDuelsStats}>
          <Trans context="Tab link">Opening duels stats</Trans>
        </TabLink>
        <TabLink url={RoutePath.MatchOpeningDuelsMap}>
          <Trans context="Tab link ">Opening duels map</Trans>
        </TabLink>
      </TabLinks>
      <Outlet />
    </>
  );
}
