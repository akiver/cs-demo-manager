import { useLingui } from '@lingui/react/macro';
import { roundNumber } from 'csdm/common/math/round-number';
import type { Column } from 'csdm/ui/components/table/table-types';
import type { GrenadeThrow } from 'csdm/common/types/grenade-throw';

function velocityFormatter(value: number) {
  return roundNumber(value);
}

export function useGrenadesFinderColumns() {
  const { t } = useLingui();

  const columns: readonly Column<GrenadeThrow>[] = [
    {
      id: 'throwerName',
      accessor: 'throwerName',
      headerText: t({
        context: 'Table header',
        message: 'Player',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: `Player's name`,
      }),
      width: 150,
      maxWidth: 300,
    },
    {
      id: 'tick',
      accessor: 'tick',
      headerText: t({
        context: 'Table header',
        message: 'Tick',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Tick',
      }),
      width: 70,
      maxWidth: 100,
    },
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
      id: 'throwerVelocityX',
      accessor: 'throwerVelocityX',
      headerText: t({
        context: 'Table header velocity',
        message: 'Vel X',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: `Thrower velocity X`,
      }),
      width: 70,
      maxWidth: 100,
      formatter: velocityFormatter,
    },
    {
      id: 'throwerVelocityY',
      accessor: 'throwerVelocityY',
      headerText: t({
        context: 'Table header velocity',
        message: 'Vel Y',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: `Thrower velocity Y`,
      }),
      width: 70,
      maxWidth: 100,
      formatter: velocityFormatter,
    },
    {
      id: 'throwerVelocityZ',
      accessor: 'throwerVelocityZ',
      headerText: t({
        context: 'Table header velocity',
        message: 'Vel Z',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: `Thrower velocity Z`,
      }),
      width: 70,
      maxWidth: 100,
      formatter: velocityFormatter,
    },
  ];

  return columns;
}
