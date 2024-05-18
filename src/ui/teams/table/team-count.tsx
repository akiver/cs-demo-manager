import React from 'react';
import { Plural } from '@lingui/macro';
import { useTeamsTable } from './use-teams-table';

export function TeamCount() {
  const table = useTeamsTable();

  return (
    <p className="selectable">
      <Plural value={table.getRowCount()} one="# team" other="# teams" />
    </p>
  );
}
