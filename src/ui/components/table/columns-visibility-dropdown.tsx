import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ColumnVisibility } from 'csdm/ui/components/table/column-visibility';
import { Dropdown } from 'csdm/ui/components/dropdown';
import type { Data, TableInstance } from 'csdm/ui/components/table/table-types';

type Props<DataType extends Data> = {
  isDisabled: boolean;
  table: TableInstance<DataType>;
  tables?: TableInstance<DataType>[]; // Possible other table instances to sync
};

export function ColumnsVisibilityDropdown<DataType extends Data>({ isDisabled, table, tables }: Props<DataType>) {
  const sortedColumns = table.getHideableColumns().sort((colA, colB) => {
    const textA = colA.visibilityText ?? colA.headerText;
    const textB = colB.visibilityText ?? colB.headerText;
    return textA.localeCompare(textB);
  });

  return (
    <Dropdown togglerContent={<Trans context="Dropdown">Columns</Trans>} isDisabled={isDisabled}>
      <div className="flex flex-wrap w-[424px] p-8 gap-8">
        {sortedColumns.map((column) => {
          return (
            <ColumnVisibility
              key={column.id}
              columnId={column.id}
              label={column.visibilityText ?? column.headerText}
              table={table}
              tables={tables}
            />
          );
        })}
      </div>
    </Dropdown>
  );
}
