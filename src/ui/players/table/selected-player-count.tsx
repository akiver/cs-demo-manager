import React from 'react';
import { Plural } from '@lingui/macro';
import { usePlayersTable } from './use-players-table';

export function SelectedPlayerCount() {
  const table = usePlayersTable();

  return (
    <p className="selectable">
      <Plural value={table.getSelectedRowCount()} one="# player selected" other="# players selected" />
    </p>
  );
}
