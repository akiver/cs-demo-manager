import { useMemo } from 'react';
import { msg } from '@lingui/macro';
import type { Column } from 'csdm/ui/components/table/table-types';
import type { Analysis } from 'csdm/common/types/analysis';
import { StatusCell } from './status-cell';
import { dateSortFunction } from 'csdm/ui/components/table/date-sort-function';
import { SourceCell } from 'csdm/ui/components/table/cells/source-cell';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function useAnalysesColumns() {
  const formatDate = useFormatDate();
  const _ = useI18n();

  const columns = useMemo(() => {
    return [
      {
        id: 'source',
        accessor: 'source',
        headerText: _(
          msg({
            message: 'Source',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Source',
            context: 'Table header tooltip',
          }),
        ),
        Cell: SourceCell,
        width: 75,
        allowResize: false,
        allowSort: false,
      },
      {
        id: 'status',
        accessor: 'status',
        headerText: _(
          msg({
            message: 'Status',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Status',
            context: 'Table header tooltip',
          }),
        ),
        width: 150,
        maxWidth: 250,
        Cell: StatusCell,
      },
      {
        id: 'demo-path',
        accessor: 'demoPath',
        headerText: _(
          msg({
            message: 'Demo path',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Demo path',
            context: 'Table header tooltip',
          }),
        ),
        width: 700,
        maxWidth: 1000,
      },
      {
        id: 'map',
        accessor: 'mapName',
        headerText: _(
          msg({
            message: 'Map',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Map',
            context: 'Table header tooltip',
          }),
        ),
        width: 140,
        maxWidth: 200,
      },
      {
        id: 'date-added',
        accessor: 'addedAt',
        headerText: _(
          msg({
            message: 'Date added',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Date added',
            context: 'Table header tooltip',
          }),
        ),
        sortFunction: dateSortFunction<Analysis>,
        formatter: (value: string) => {
          return formatDate(value);
        },
        width: 200,
        maxWidth: 250,
      },
    ] as const satisfies readonly Column<Analysis>[];
  }, [_, formatDate]);

  return columns;
}
