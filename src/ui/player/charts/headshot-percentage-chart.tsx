import React from 'react';
import { useLingui } from '@lingui/react/macro';
import type { Axis } from './x-axis';
import { usePlayerChartOptions } from './use-player-chart-options';
import { buildAveragePlayerChartData } from './build-average-player-chart-data';
import { useChart } from 'csdm/ui/hooks/use-chart';
import { usePlayer } from '../use-player';
import { roundNumber } from 'csdm/common/math/round-number';

type Props = {
  axis: Axis;
};

export function HeadshotPercentageChart({ axis }: Props) {
  const { chartsData } = usePlayer();
  const { t } = useLingui();
  const data: [string, number][] = buildAveragePlayerChartData({
    field: 'headshotPercentage',
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
    data,
    minValue: Math.max(0, roundNumber(minValue - 1)),
    maxValue: roundNumber(maxValue + 1),
    title: t({
      context: 'Chart title',
      message: 'Headshot percentage over time',
    }),
    name: t({
      context: 'Chart axis label',
      message: 'HS%',
    }),
    yLineParallelToXAxisValue: (maxValue + minValue) / 2,
  });

  const { ref } = useChart({
    option: chartOptions,
  });

  return <div className="w-full h-[352px]" ref={ref} />;
}
