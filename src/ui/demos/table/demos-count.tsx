import React from 'react';
import { Plural } from '@lingui/react/macro';
import { useDemosTable } from './use-demos-table';

export function DemosCount() {
  const table = useDemosTable();

  return (
    <p className="selectable">
      <Plural value={table.getRowCount()} one="# demo" other="# demos" />
    </p>
  );
}
