import React from 'react';
import clsx from 'clsx';
import type { Data, TableInstance } from 'csdm/ui/components/table/table-types';

type Props<DataType extends Data> = {
  columnId: string;
  label: string;
  table: TableInstance<DataType>;
  tables?: TableInstance<DataType>[];
};

export function ColumnVisibility<DataType extends Data>({ table, columnId, label, tables = [] }: Props<DataType>) {
  const isVisible = table.isColumnVisible(columnId);

  const onClick = () => {
    const allTables = [table, ...tables];
    for (const table of allTables) {
      if (isVisible) {
        table.hideColumn(columnId);
      } else {
        table.showColumn(columnId);
      }
    }
  };

  return (
    <button
      className={clsx(
        'flex cursor-default items-center justify-center rounded border px-8 py-4 text-caption select-none hover:text-gray-900',
        isVisible
          ? 'border-gray-400 bg-gray-50 text-gray-900 hover:bg-gray-100'
          : 'border-transparent bg-gray-200 text-gray-600',
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
