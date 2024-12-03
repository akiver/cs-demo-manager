import React from 'react';
import { Plural } from '@lingui/react/macro';
import { useMatchesTable } from './use-matches-table';

export function SelectedMatchCount() {
  const table = useMatchesTable();

  return (
    <p className="selectable">
      <Plural value={table.getSelectedRowCount()} one="# match selected" other="# matches selected" />
    </p>
  );
}
