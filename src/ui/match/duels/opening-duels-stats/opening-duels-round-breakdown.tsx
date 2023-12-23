import React, { useMemo } from 'react';
import { msg } from '@lingui/macro';
import type { Kill } from 'csdm/common/types/kill';
import { useI18n } from 'csdm/ui/hooks/use-i18n';
import type { Column } from 'csdm/ui/components/table/table-types';
import { Table } from 'csdm/ui/components/table/table';
import { useTable } from 'csdm/ui/components/table/use-table';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { OpeningDuelContextMenu } from '../opening-duels-map/opening-duel-context-menu';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useCounterStrike } from 'csdm/ui/hooks/use-counter-strike';
import { useCurrentMatch } from '../../use-current-match';
import { CounterStrikeRunningDialog } from 'csdm/ui/components/dialogs/counter-strike-running-dialog';
import { useTranslateTeamNumber } from 'csdm/ui/hooks/use-translate-team-number';
import { KillAttributesCell } from 'csdm/ui/components/table/cells/kill-attributes-cell';

function useColumns() {
  const _ = useI18n();
  const translateTeam = useTranslateTeamNumber();

  const columns = useMemo(() => {
    return [
      {
        id: 'roundNumber',
        accessor: 'roundNumber',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Round',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Round',
          }),
        ),
        width: 80,
        maxWidth: 120,
      },
      {
        id: 'killerName',
        accessor: 'killerName',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Killer',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: `Killer's name`,
          }),
        ),
        width: 150,
        maxWidth: 300,
      },
      {
        id: 'killerSide',
        accessor: 'killerSide',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Killer side',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: `Killer's side`,
          }),
        ),
        formatter: translateTeam,
        width: 90,
        maxWidth: 140,
      },
      {
        id: 'victimName',
        accessor: 'victimName',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Victim',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: `Victim's name`,
          }),
        ),
        width: 150,
        maxWidth: 300,
      },
      {
        id: 'victimSide',
        accessor: 'victimSide',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Victim side',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: `Victim's side`,
          }),
        ),
        formatter: translateTeam,
        width: 90,
        maxWidth: 140,
      },
      {
        id: 'weaponName',
        accessor: 'weaponName',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Weapon',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: `Weapon's name`,
          }),
        ),
        width: 150,
        maxWidth: 300,
      },
      {
        id: 'attributes',
        accessor: 'id',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Attributes',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: `Kill's attributes`,
          }),
        ),
        width: 150,
        maxWidth: 300,
        Cell: KillAttributesCell,
      },
    ] as const satisfies readonly Column<Kill>[];
  }, [_, translateTeam]);

  return columns;
}

function getRowId(kill: Kill): string {
  return String(kill.id);
}

type Props = {
  openingKills: Kill[];
};

export function OpeningDuelsRoundBreakdown({ openingKills }: Props) {
  const match = useCurrentMatch();
  const { showContextMenu } = useContextMenu();
  const { watchDemo, isKillCsRequired } = useCounterStrike();
  const { showDialog } = useDialog();

  const watchKill = (kill: Kill) => {
    watchDemo({
      demoPath: match.demoFilePath,
      startTick: kill.tick - match.tickrate * 5,
      focusSteamId: kill.killerSteamId,
    });
  };

  const onWatchClick = async (kill: Kill) => {
    const shouldKillCs = await isKillCsRequired();
    if (shouldKillCs) {
      showDialog(
        <CounterStrikeRunningDialog
          onConfirmClick={() => {
            watchKill(kill);
          }}
        />,
      );
    } else {
      watchKill(kill);
    }
  };

  const table = useTable<Kill>({
    data: openingKills,
    columns: useColumns(),
    getRowId,
    rowSelection: 'single',
    onContextMenu: (event, table) => {
      const kills = table.getSelectedRows();
      if (kills.length > 0) {
        showContextMenu(event, <OpeningDuelContextMenu kill={kills[0]} onWatchClick={onWatchClick} />);
      }
    },
  });

  return <Table<Kill> table={table} />;
}
