import { useLingui } from '@lingui/react/macro';
import type { Column } from 'csdm/ui/components/table/table-types';
import type { Kill } from 'csdm/common/types/kill';
import { KillAttributesCell } from 'csdm/ui/components/table/cells/kill-attributes-cell';

export function useOpeningDuelsMapColumns() {
  const { t } = useLingui();

  const columns: readonly Column<Kill>[] = [
    {
      id: 'roundNumber',
      accessor: 'roundNumber',
      headerText: t({
        context: 'Table header',
        message: 'Round',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Round',
      }),
      width: 40,
      maxWidth: 100,
    },
    {
      id: 'killerName',
      accessor: 'killerName',
      headerText: t({
        context: 'Table header',
        message: 'Killer',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: `Killer's name`,
      }),
      width: 150,
      maxWidth: 300,
    },
    {
      id: 'victimName',
      accessor: 'victimName',
      headerText: t({
        context: 'Table header',
        message: 'Victim',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: `Victim's name`,
      }),
      width: 150,
      maxWidth: 300,
    },
    {
      id: 'weaponName',
      accessor: 'weaponName',
      headerText: t({
        context: 'Table header',
        message: 'Weapon',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: `Weapon's name`,
      }),
      width: 150,
      maxWidth: 300,
    },
    {
      id: 'attributes',
      accessor: 'id',
      headerText: t({
        context: 'Table header',
        message: 'Attributes',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: `Kill's attributes`,
      }),
      width: 150,
      maxWidth: 300,
      Cell: KillAttributesCell,
    },
  ];

  return columns;
}
