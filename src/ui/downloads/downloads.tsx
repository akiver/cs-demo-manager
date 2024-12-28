import React from 'react';
import { Outlet } from 'react-router';
import { RoutePath } from 'csdm/ui/routes-paths';
import { TabLink } from 'csdm/ui/components/tabs/tab-link';
import { TabLinks } from 'csdm/ui/components/tabs/tab-links';
import { PendingDownloadsLink } from './pending-downloads-link';

export function Downloads() {
  return (
    <>
      <TabLinks>
        <TabLink url="">Valve</TabLink>
        <TabLink url={RoutePath.DownloadsFaceit}>FACEIT</TabLink>
        <TabLink url={RoutePath.Downloads5EPlay}>5EPlay</TabLink>
        <PendingDownloadsLink />
      </TabLinks>
      <Outlet />
    </>
  );
}
