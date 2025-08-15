import { useLingui } from '@lingui/react/macro';
import type { Column } from 'csdm/ui/components/table/table-types';
import type { Analysis } from 'csdm/common/types/analysis';
import { StatusCell } from './status-cell';
import { dateSortFunction } from 'csdm/ui/components/table/date-sort-function';
import { SourceCell } from 'csdm/ui/components/table/cells/source-cell';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';

export function useAnalysesColumns() {
  const formatDate = useFormatDate();
  const { t } = useLingui();

  const columns: readonly Column<Analysis>[] = [
    {
      id: 'source',
      accessor: 'source',
      headerText: t({
        message: 'Source',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Source',
        context: 'Table header tooltip',
      }),
      Cell: SourceCell,
      width: 75,
      allowResize: false,
      allowSort: false,
    },
    {
      id: 'status',
      accessor: 'status',
      headerText: t({
        message: 'Status',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Status',
        context: 'Table header tooltip',
      }),
      width: 150,
      maxWidth: 250,
      Cell: StatusCell,
    },
    {
      id: 'demo-path',
      accessor: 'demoPath',
      headerText: t({
        message: 'Demo path',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Demo path',
        context: 'Table header tooltip',
      }),
      width: 700,
      maxWidth: 1000,
    },
    {
      id: 'map',
      accessor: 'mapName',
      headerText: t({
        message: 'Map',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Map',
        context: 'Table header tooltip',
      }),
      width: 140,
      maxWidth: 200,
    },
    {
      id: 'date-added',
      accessor: 'addedAt',
      headerText: t({
        message: 'Date added',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Date added',
        context: 'Table header tooltip',
      }),
      sortFunction: dateSortFunction<Analysis>,
      formatter: (value: string) => {
        return formatDate(value);
      },
      width: 200,
      maxWidth: 250,
    },
  ];

  return columns;
}
