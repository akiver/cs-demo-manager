import React from 'react';
import { Plural } from '@lingui/react/macro';
import { useTeamsTable } from './use-teams-table';

export function SelectedTeamCount() {
  const table = useTeamsTable();

  return (
    <p className="selectable">
      <Plural value={table.getSelectedRowCount()} one="# team selected" other="# teams selected" />
    </p>
  );
}
