import { useMemo } from 'react';
import { msg } from '@lingui/macro';
import { roundNumber } from 'csdm/common/math/round-number';
import type { Column } from 'csdm/ui/components/table/table-types';
import type { GrenadeThrow } from 'csdm/common/types/grenade-throw';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

function velocityFormatter(value: number) {
  return roundNumber(value);
}

export function useGrenadesFinderColumns() {
  const _ = useI18n();

  const columns = useMemo(() => {
    return [
      {
        id: 'throwerName',
        accessor: 'throwerName',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Player',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: `Player's name`,
          }),
        ),
        width: 150,
        maxWidth: 300,
      },
      {
        id: 'tick',
        accessor: 'tick',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Tick',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Tick',
          }),
        ),
        width: 70,
        maxWidth: 100,
      },
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
        id: 'throwerVelocityX',
        accessor: 'throwerVelocityX',
        headerText: _(
          msg({
            context: 'Table header velocity',
            message: 'Vel X',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: `Thrower velocity X`,
          }),
        ),
        width: 70,
        maxWidth: 100,
        formatter: velocityFormatter,
      },
      {
        id: 'throwerVelocityY',
        accessor: 'throwerVelocityY',
        headerText: _(
          msg({
            context: 'Table header velocity',
            message: 'Vel Y',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: `Thrower velocity Y`,
          }),
        ),
        width: 70,
        maxWidth: 100,
        formatter: velocityFormatter,
      },
      {
        id: 'throwerVelocityZ',
        accessor: 'throwerVelocityZ',
        headerText: _(
          msg({
            context: 'Table header velocity',
            message: 'Vel Z',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: `Thrower velocity Z`,
          }),
        ),
        width: 70,
        maxWidth: 100,
        formatter: velocityFormatter,
      },
    ] as const satisfies readonly Column<GrenadeThrow>[];
  }, [_]);

  return columns;
}
