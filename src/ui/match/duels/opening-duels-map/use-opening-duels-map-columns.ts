import { useMemo } from 'react';
import { msg } from '@lingui/macro';
import type { Column } from 'csdm/ui/components/table/table-types';
import { useI18n } from 'csdm/ui/hooks/use-i18n';
import type { Kill } from 'csdm/common/types/kill';
import { KillAttributesCell } from 'csdm/ui/components/table/cells/kill-attributes-cell';

export function useOpeningDuelsMapColumns() {
  const _ = useI18n();

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
        width: 40,
        maxWidth: 100,
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
  }, [_]);

  return columns;
}
