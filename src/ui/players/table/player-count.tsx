import React from 'react';
import { Plural } from '@lingui/react/macro';
import { usePlayersTable } from './use-players-table';

export function PlayerCount() {
  const table = usePlayersTable();

  return (
    <p className="selectable">
      <Plural value={table.getRowCount()} one="# player" other="# players" />
    </p>
  );
}
