import { useLingui } from '@lingui/react/macro';
import { useSecondsToFormattedMinutes } from 'csdm/ui/hooks/use-seconds-to-formatted-minutes';
import { CommentCell } from 'csdm/ui/components/table/cells/comment-cell';
import { SourceCell } from 'csdm/ui/components/table/cells/source-cell';
import { TagsCell } from 'csdm/ui/components/table/cells/tags-cell';
import { roundNumber } from 'csdm/common/math/round-number';
import { DemoStatusCell } from './demo-status-cell';
import type { Column } from 'csdm/ui/components/table/table-types';
import type { Demo } from 'csdm/common/types/demo';
import { dateSortFunction } from 'csdm/ui/components/table/date-sort-function';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';
import { useGetDemoAnalysisStatus } from 'csdm/ui/analyses/use-get-demo-analysis-status';
import { AnalysisStatus } from 'csdm/common/types/analysis-status';

export function useDemosColumns() {
  const formatDate = useFormatDate();
  const secondsToFormattedMinutes = useSecondsToFormattedMinutes();
  const getDemoAnalysisStatus = useGetDemoAnalysisStatus();
  const { t } = useLingui();

  const columns: readonly Column<Demo>[] = [
    {
      id: 'comment',
      accessor: 'comment',
      headerText: '',
      headerTooltip: t({
        message: 'Comment',
        context: 'Table header tooltip',
      }),
      width: 20,
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Comment',
      }),
      Cell: CommentCell,
      allowResize: false,
      allowMove: false,
    },
    {
      id: 'tags',
      accessor: 'tagIds',
      headerText: '',
      headerTooltip: t({
        message: 'Tags',
        context: 'Table header tooltip',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Tags',
      }),
      Cell: TagsCell,
      width: 20,
      allowResize: false,
      allowMove: false,
      allowSort: false,
    },
    {
      id: 'status',
      accessor: 'filePath',
      headerText: '',
      headerTooltip: t({
        message: 'Status',
        context: 'Table header tooltip',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Status',
      }),
      Cell: DemoStatusCell,
      width: 30,
      allowResize: false,
      allowMove: false,
      sortFunction: (sortDirection) => {
        const statusOrder: (AnalysisStatus | undefined)[] = [
          undefined,
          AnalysisStatus.Pending,
          AnalysisStatus.Analyzing,
          AnalysisStatus.AnalyzeSuccess,
          AnalysisStatus.AnalyzeError,
          AnalysisStatus.Inserting,
          AnalysisStatus.InsertSuccess,
          AnalysisStatus.InsertError,
        ];

        return (demoA: Demo, demoB: Demo) => {
          const statusA = getDemoAnalysisStatus(demoA.checksum);
          const statusB = getDemoAnalysisStatus(demoB.checksum);

          if (sortDirection === 'asc') {
            return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB);
          }

          return statusOrder.indexOf(statusB) - statusOrder.indexOf(statusA);
        };
      },
    },
    {
      id: 'game',
      accessor: 'game',
      headerText: t({
        message: 'Game',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Game',
        context: 'Table header tooltip',
      }),
      width: 50,
      maxWidth: 100,
    },
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
      id: 'type',
      accessor: 'type',
      headerText: t({
        message: 'Type',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Type',
        context: 'Table header tooltip',
      }),
      width: 60,
      maxWidth: 120,
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
      width: 120,
      maxWidth: 200,
    },
    {
      id: 'name',
      accessor: 'name',
      headerText: t({
        message: 'Name',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Name',
        context: 'Table header tooltip',
      }),
      width: 400,
      maxWidth: 700,
      showTooltip: true,
    },
    {
      id: 'path',
      accessor: 'filePath',
      headerText: t({
        message: 'Path',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Path',
        context: 'Table header tooltip',
      }),
      width: 200,
      maxWidth: 1200,
      showTooltip: true,
    },
    {
      id: 'date',
      accessor: 'date',
      headerText: t({
        message: 'Date',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Date',
        context: 'Table header tooltip',
      }),
      width: 150,
      maxWidth: 200,
      sortFunction: dateSortFunction<Demo>,
      formatter: (value: string) => {
        return formatDate(value);
      },
    },
    {
      id: 'duration',
      accessor: 'duration',
      headerText: t({
        message: 'Duration',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Duration',
        context: 'Table header tooltip',
      }),
      width: 90,
      maxWidth: 140,
      formatter: (seconds: number) => {
        return secondsToFormattedMinutes(seconds, 'short');
      },
    },
    {
      id: 'tickCount',
      accessor: 'tickCount',
      headerText: t({
        message: 'Ticks',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Ticks',
        context: 'Table header tooltip',
      }),
      width: 80,
      maxWidth: 120,
      textAlign: 'right',
      visible: false,
    },
    {
      id: 'tickrate',
      accessor: 'tickrate',
      headerText: t({
        message: 'Tickrate',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Tickrate',
        context: 'Table header tooltip',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
      formatter: roundNumber,
    },
    {
      id: 'frameRate',
      accessor: 'frameRate',
      headerText: t({
        message: 'Frame rate',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Frame rate',
        context: 'Table header tooltip',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
      formatter: roundNumber,
    },
    {
      id: 'server-name',
      accessor: 'serverName',
      headerText: t({
        message: 'Server name',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Server name',
        context: 'Table header tooltip',
      }),
      width: 250,
      maxWidth: 500,
    },
    {
      id: 'client-name',
      accessor: 'clientName',
      headerText: t({
        message: 'Client name',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Client name',
        context: 'Table header tooltip',
      }),
      width: 200,
    },
  ];

  return columns;
}
