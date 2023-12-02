import React from 'react';
import { msg } from '@lingui/macro';
import { roundNumber } from 'csdm/common/math/round-number';
import type { Axis } from './x-axis';
import { usePlayerChartOptions } from './use-player-chart-options';
import { buildAveragePlayerChartData } from './build-average-player-chart-data';
import { useChart } from 'csdm/ui/hooks/use-chart';
import { usePlayer } from '../use-player';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

type Props = {
  axis: Axis;
};

export function AverageDamagePerRoundChart({ axis }: Props) {
  const { chartsData } = usePlayer();
  const _ = useI18n();
  const data: [string, number][] = buildAveragePlayerChartData({
    field: 'averageDamagePerRound',
    chartsData,
    axis,
  });
  const firstValue = data.length > 0 ? data[0][1] : 0;
  let maxValue = firstValue;
  let minValue = firstValue;
  for (const tuple of data) {
    if (tuple[1] > maxValue) {
      maxValue = tuple[1];
    }
    if (tuple[1] < minValue) {
      minValue = tuple[1];
    }
  }

  const chartOptions = usePlayerChartOptions({
    axis,
    data: data,
    minValue: Math.max(0, roundNumber(minValue - 5)),
    maxValue: roundNumber(maxValue + 5),
    title: _(
      msg({
        context: 'Chart title',
        message: 'Damage Per Round over time',
      }),
    ),
    name: _(
      msg({
        context: 'Chart axis label average damage per round',
        message: 'ADR',
      }),
    ),
    yLineParallelToXAxisValue: (maxValue + minValue) / 2,
  });

  const { ref } = useChart({
    option: chartOptions,
  });

  return <div className="w-full h-[352px]" ref={ref} />;
}
