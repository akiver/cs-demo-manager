import React from 'react';
import { TableStatusBarSeparator } from 'csdm/ui/components/table/status-bar/table-status-bar-separator';
import { TableStatusBar } from 'csdm/ui/components/table/status-bar/table-status-bar';
import { DemosCount } from './demos-count';
import { SelectedDemoCount } from './selected-demo-count';

export function DemosTableStatusBar() {
  return (
    <TableStatusBar>
      <DemosCount />
      <TableStatusBarSeparator />
      <SelectedDemoCount />
    </TableStatusBar>
  );
}
