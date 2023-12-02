import React from 'react';
import type { Data, TableInstance } from 'csdm/ui/components/table/table-types';

type Props<DataType extends Data> = {
  columnId: string;
  label: string;
  table: TableInstance<DataType>;
};

export function ColumnVisibility<DataType extends Data>({ table, columnId, label }: Props<DataType>) {
  const isVisible = table.isColumnVisible(columnId);

  const onClick = () => {
    if (isVisible) {
      table.hideColumn(columnId);
    } else {
      table.showColumn(columnId);
    }
  };

  return (
    <button
      className={`flex items-center justify-center px-8 py-4 border rounded hover:text-gray-900 select-none text-caption cursor-default ${
        isVisible
          ? 'bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-400'
          : 'bg-gray-200 text-gray-600 border-transparent'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
