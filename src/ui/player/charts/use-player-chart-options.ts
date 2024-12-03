import { useLingui } from '@lingui/react/macro';
import type { ChartOption } from 'csdm/ui/hooks/use-chart';
import { useUnixTimestampToHumanizedDate } from 'csdm/ui/hooks/use-unix-timestamp-to-humanized-date';
import type { Axis } from './x-axis';
import { useChartColors } from 'csdm/ui/hooks/use-charts-colors';
import { assertNever } from 'csdm/common/assert-never';

function useGetTimeAxisTitle() {
  const { t } = useLingui();

  const getTimeAxisTitle = (axis: Axis) => {
    switch (axis) {
      case 'day':
        return t({
          context: 'Select option time period',
          message: 'Day',
        });
      case 'month':
        return t({
          context: 'Select option time period',
          message: 'Month',
        });
      case 'year':
        return t({
          context: 'Select option time period',
          message: 'Year',
        });
      case 'match':
        return t({
          context: 'Select option time period',
          message: 'Match',
        });
      default:
        assertNever(axis, `Unsupported axis: ${axis}`);
    }
  };

  return { getTimeAxisTitle };
}

function useGetTimeAxisLabel() {
  const unixTimestampToHumanizedDate = useUnixTimestampToHumanizedDate();

  const getTimeAxisLabel = (axis: Axis, timestamp: number, axisIndex: number) => {
    if (axis === 'match') {
      return String(axisIndex + 1);
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: axis === 'year' ? undefined : 'numeric',
      day: axis === 'day' ? 'numeric' : undefined,
    };

    return unixTimestampToHumanizedDate(timestamp, formatOptions);
  };

  return { getTimeAxisLabel };
}

type Options = {
  axis: Axis;
  title: string;
  minValue: number;
  maxValue: number;
  data: [string, number][];
  name: string;
  yLineParallelToXAxisValue: number;
};

export function usePlayerChartOptions({
  title,
  data,
  axis,
  minValue,
  maxValue,
  name,
  yLineParallelToXAxisValue,
}: Options) {
  const colors = useChartColors();
  const { getTimeAxisTitle } = useGetTimeAxisTitle();
  const { getTimeAxisLabel } = useGetTimeAxisLabel();
  const xAxisTitle = getTimeAxisTitle(axis);

  const options: ChartOption = {
    zoomEnabled: true,
    grid: {
      left: 40,
      right: 40,
    },
    color: ['#6767ec'],
    title: {
      text: title,
      left: 'center',
      textStyle: {
        color: colors.titleTextColor,
        fontWeight: 500,
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: colors.tooltipBackgroundColor,
      borderColor: colors.tooltipBorderColor,
      textStyle: {
        color: colors.tooltipTextColor,
      },
    },
    xAxis: {
      name: xAxisTitle,
      type: 'category',
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        color: colors.axisColor,
        formatter: (timestamp: string, index: number) => {
          return getTimeAxisLabel(axis, Number(timestamp), index);
        },
      },
      axisPointer: {
        label: {
          formatter: ({ value, seriesData }) => {
            return getTimeAxisLabel(axis, value as number, seriesData[0].dataIndex);
          },
        },
      },
      axisLine: {
        lineStyle: {
          color: colors.axisColor,
        },
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      name,
      min: minValue,
      max: maxValue,
      type: 'value',
      splitLine: {
        lineStyle: {
          color: colors.splitLineColor,
        },
      },
      axisTick: {
        show: true,
      },
      axisLabel: {
        color: colors.axisColor,
      },
      axisLine: {
        lineStyle: {
          color: colors.axisColor,
        },
      },
    },
    dataZoom: {
      type: 'inside',
      filterMode: 'none',
      zoomOnMouseWheel: 'shift',
      zoomLock: true,
    },
    series: [
      {
        data,
        name,
        type: 'line',
        symbolSize: [6, 6],
        label: { show: true, color: colors.labelTextColor },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            color: colors.markLineColor,
          },
          data: [
            {
              yAxis: yLineParallelToXAxisValue,
              label: {
                color: colors.labelTextColor,
              },
              symbolOffset: 0,
            },
          ],
        },
      },
    ],
  };

  return options;
}
