import type { ReactNode } from 'react';
import React from 'react';
import clsx from 'clsx';
import type { Data, TableInstance } from './table-types';
import { ArrowDownLongIcon } from 'csdm/ui/icons/arrow-down-long-icon';
import { ArrowUpLongIcon } from 'csdm/ui/icons/arrow-up-long-icon';

type Props<DataType extends Data> = {
  table: TableInstance<DataType>;
};

export function Table<DataType extends Data>({ table }: Props<DataType>) {
  const rows = table.getRows();
  const orderedColumns = table.getOrderedColumns();
  const virtualItems = table.getVirtualItems();
  const totalSize = table.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0 ? totalSize - virtualItems[virtualItems.length - 1].end : 0;
  const tableStyle = {
    '--virtualPaddingTop': `${paddingTop}px`,
    '--virtualPaddingBottom': `${paddingBottom}px`,
  } as React.CSSProperties;

  return (
    <div className="h-full overflow-auto will-change-scroll" {...table.getWrapperProps()}>
      <table
        className="w-fit table-fixed border-collapse border-spacing-0 outline-hidden"
        style={tableStyle}
        tabIndex={0}
        role="presentation"
        aria-rowcount={rows.length}
        {...table.getTableProps()}
      >
        <thead>
          <tr>
            {orderedColumns.map((column, index) => {
              if (!table.isColumnVisible(column.id)) {
                return null;
              }

              const dragEnabled = column.allowMove !== false;
              const sortEnabled = column.allowSort !== false;
              const style: React.CSSProperties = {
                width: table.getColumnWidth(column.id),
              };

              const renderSortIndicator = () => {
                const sortDirection = table.getColumnSortDirection(column.id);
                if (!sortEnabled || sortDirection === undefined) {
                  return null;
                }

                return (
                  <div className={column.allowResize ? 'px-4' : ''}>
                    {sortDirection === 'desc' ? <ArrowDownLongIcon height={16} /> : <ArrowUpLongIcon height={16} />}
                  </div>
                );
              };

              const { resizerProps, hasDragOver, sortProps, dragProps, ...columnProps } = table.getColumnProps(
                column,
                index,
              );

              return (
                <th
                  key={column.id}
                  className={clsx(
                    'sticky top-0 z-1 h-32 bg-gray-50 p-0 outline-hidden',
                    sortEnabled ? 'cursor-pointer' : 'cursor-default',
                    dragEnabled ? 'drag-element' : 'drag-none',
                  )}
                  id={column.id}
                  style={style}
                  title={column.headerTooltip}
                  {...(dragEnabled && dragProps)}
                  {...(sortEnabled && sortProps)}
                  {...columnProps}
                >
                  <div
                    className={clsx(
                      'flex h-full items-center justify-between border-y border-r border-gray-300 px-8 last:border-r-0',
                      hasDragOver ? 'border-l-2 border-l-blue-700' : 'border-l-transparent',
                    )}
                  >
                    <span
                      className={clsx(
                        'flex-1 truncate text-body-strong',
                        column.textAlign === 'right' ? 'text-right' : 'text-left',
                      )}
                    >
                      {column.headerText}
                    </span>
                    {renderSortIndicator()}
                    {column.allowResize !== false && (
                      <div
                        className="absolute top-0 right-0 h-full w-8 cursor-col-resize border-r-2 border-r-gray-500"
                        {...resizerProps}
                      />
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="before:block before:pt-[var(--virtualPaddingTop)] before:content-[''] after:block after:pb-[var(--virtualPaddingBottom)] after:content-['']">
          {table.getVirtualItems().map((item, index) => {
            const row = rows[item.index];
            const rowIndex = item.index;
            const rowId = table.getRowId(row);
            const isSelected = table.isRowSelected(rowId);
            const rowProps = table.getRowProps(rowId, row, rowIndex);
            const isSelectionEnabled = table.isSelectionEnabled();

            return (
              <tr
                className={clsx(
                  'h-[var(--table-row-height)] outline-hidden',
                  isSelected ? 'bg-gray-300!' : isSelectionEnabled && 'bg-gray-50 hover:bg-gray-200!',
                )}
                key={rowId}
                role="row"
                tabIndex={index}
                aria-rowindex={index + 1}
                {...rowProps}
              >
                {orderedColumns.map((column) => {
                  if (!table.isColumnVisible(column.id)) {
                    return null;
                  }

                  const { accessor, formatter, Cell } = column;
                  const value = typeof accessor === 'string' ? row[accessor] : accessor(row);
                  const formattedValue = typeof formatter === 'function' ? formatter(value) : (value as ReactNode);

                  return (
                    <td
                      key={column.id}
                      className={clsx(
                        'max-w-0 selectable truncate overflow-hidden border-r border-b border-gray-300 last:border-r-0',
                        column.textAlign === 'right' ? 'text-right' : 'text-left',
                        column.noPadding ? 'p-0' : 'px-4',
                      )}
                      title={column.showTooltip ? String(formattedValue) : undefined}
                    >
                      {Cell ? <Cell data={row} rowIndex={index} noPadding={column.noPadding} /> : formattedValue}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
