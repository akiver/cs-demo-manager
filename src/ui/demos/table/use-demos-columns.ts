import { useMemo } from 'react';
import { msg } from '@lingui/macro';
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
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function useDemosColumns() {
  const formatDate = useFormatDate();
  const secondsToFormattedMinutes = useSecondsToFormattedMinutes();
  const _ = useI18n();

  const columns = useMemo(() => {
    return [
      {
        id: 'comment',
        accessor: 'comment',
        headerText: '',
        headerTooltip: _(
          msg({
            message: 'Comment',
            context: 'Table header tooltip',
          }),
        ),
        width: 20,
        visibilityText: 'Comment',
        Cell: CommentCell,
        allowResize: false,
        allowSort: false,
        allowMove: false,
      },
      {
        id: 'tags',
        accessor: 'tagIds',
        headerText: '',
        headerTooltip: _(
          msg({
            message: 'Tags',
            context: 'Table header tooltip',
          }),
        ),
        visibilityText: 'Tags',
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
        headerTooltip: _(
          msg({
            message: 'Status',
            context: 'Table header tooltip',
          }),
        ),
        visibilityText: 'Status',
        Cell: DemoStatusCell,
        width: 30,
        allowResize: false,
        allowMove: false,
        allowSort: false,
      },
      {
        id: 'game',
        accessor: 'game',
        headerText: _(
          msg({
            message: 'Game',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Game',
            context: 'Table header tooltip',
          }),
        ),
        width: 50,
        maxWidth: 100,
      },
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
        id: 'type',
        accessor: 'type',
        headerText: _(
          msg({
            message: 'Type',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Type',
            context: 'Table header tooltip',
          }),
        ),
        width: 60,
        maxWidth: 120,
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
        width: 120,
        maxWidth: 200,
      },
      {
        id: 'name',
        accessor: 'name',
        headerText: _(
          msg({
            message: 'Name',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Name',
            context: 'Table header tooltip',
          }),
        ),
        width: 400,
        maxWidth: 700,
        showTooltip: true,
      },
      {
        id: 'path',
        accessor: 'filePath',
        headerText: _(
          msg({
            message: 'Path',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Path',
            context: 'Table header tooltip',
          }),
        ),
        width: 200,
        maxWidth: 1200,
        showTooltip: true,
      },
      {
        id: 'date',
        accessor: 'date',
        headerText: _(
          msg({
            message: 'Date',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Date',
            context: 'Table header tooltip',
          }),
        ),
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
        headerText: _(
          msg({
            message: 'Duration',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Duration',
            context: 'Table header tooltip',
          }),
        ),
        width: 90,
        maxWidth: 140,
        formatter: (seconds: number) => {
          return secondsToFormattedMinutes(seconds, 'short');
        },
      },
      {
        id: 'tickCount',
        accessor: 'tickCount',
        headerText: _(
          msg({
            message: 'Ticks',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Ticks',
            context: 'Table header tooltip',
          }),
        ),
        width: 80,
        maxWidth: 120,
        textAlign: 'right',
        visible: false,
      },
      {
        id: 'tickrate',
        accessor: 'tickrate',
        headerText: _(
          msg({
            message: 'Tickrate',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Tickrate',
            context: 'Table header tooltip',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
        formatter: roundNumber,
      },
      {
        id: 'frameRate',
        accessor: 'frameRate',
        headerText: _(
          msg({
            message: 'Frame rate',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Frame rate',
            context: 'Table header tooltip',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
        formatter: roundNumber,
      },
      {
        id: 'server-name',
        accessor: 'serverName',
        headerText: _(
          msg({
            message: 'Server name',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Server name',
            context: 'Table header tooltip',
          }),
        ),
        width: 250,
        maxWidth: 500,
      },
      {
        id: 'client-name',
        accessor: 'clientName',
        headerText: _(
          msg({
            message: 'Client name',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Client name',
            context: 'Table header tooltip',
          }),
        ),
        width: 200,
      },
    ] as const satisfies readonly Column<Demo>[];
  }, [_, formatDate, secondsToFormattedMinutes]);

  return columns;
}
