import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ChartOption } from 'csdm/ui/hooks/use-chart';
import { useChart } from 'csdm/ui/hooks/use-chart';
import { getDateFirstDay } from 'csdm/common/date/get-date-first-day';
import { dateToUnixTimestamp } from 'csdm/common/date/date-to-unix-timestamp';
import { useUnixTimestampToHumanizedDate } from 'csdm/ui/hooks/use-unix-timestamp-to-humanized-date';
import { NoBanMessage } from './no-ban-message';
import { Panel, PanelTitle } from 'csdm/ui/components/panel';
import { useChartColors } from 'csdm/ui/hooks/use-charts-colors';
import type { BannedSteamAccount } from 'csdm/common/types/banned-steam-account';

type BanPerMonth = {
  [timestamp: string]: number;
};

function useGetTimeAxisLabel() {
  const unixTimestampToHumanizedDate = useUnixTimestampToHumanizedDate();

  const getTimeAxisLabel = (timestamp: number) => {
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
    };

    return unixTimestampToHumanizedDate(timestamp, formatOptions);
  };

  return { getTimeAxisLabel };
}

type Props = {
  bannedAccounts: BannedSteamAccount[];
};

export function BanPerDateChart({ bannedAccounts }: Props) {
  const colors = useChartColors();
  const { getTimeAxisLabel } = useGetTimeAxisLabel();
  const { t } = useLingui();

  const banPerMonth: BanPerMonth = {};
  for (const account of bannedAccounts) {
    const banDate = new Date(account.lastBanDate);
    const firstDayOfMonth = getDateFirstDay(banDate);
    const monthTimestamp = dateToUnixTimestamp(firstDayOfMonth);
    if (banPerMonth[monthTimestamp] === undefined) {
      banPerMonth[monthTimestamp] = 1;
    } else {
      banPerMonth[monthTimestamp]++;
    }
  }

  const bansCount = Object.values(banPerMonth);
  const maxBanCount = Math.max(...bansCount);
  const minBanCount = Math.min(...bansCount);
  const monthTimestamps = Object.keys(banPerMonth);

  const option: ChartOption = {
    color: ['#6767ec'],
    xAxis: {
      name: t({
        context: 'Chart axis label',
        message: 'Date',
      }),
      type: 'category',
      data: monthTimestamps,
      axisLabel: {
        color: colors.axisColor,
        formatter: (timestamp: string) => {
          return getTimeAxisLabel(Number(timestamp));
        },
      },
      axisPointer: {
        label: {
          formatter: ({ value }) => {
            return getTimeAxisLabel(value as number);
          },
        },
      },
      axisLine: {
        lineStyle: {
          color: colors.axisColor,
        },
      },
      splitLine: {
        lineStyle: {
          color: colors.splitLineColor,
        },
        show: true,
      },
    },
    yAxis: {
      name: t({
        context: 'Chart axis label',
        message: 'Bans',
      }),
      type: 'value',
      min: Math.max(0, minBanCount - 1),
      max: maxBanCount + 1,
      splitLine: {
        show: false,
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
    tooltip: {
      trigger: 'axis',
      backgroundColor: colors.tooltipBackgroundColor,
      borderColor: colors.tooltipBorderColor,
      textStyle: {
        color: colors.tooltipTextColor,
      },
    },
    dataZoom: [
      {
        type: 'inside',
      },
    ],
    series: [
      {
        data: bansCount,
        type: 'line',
        name: t({
          context: 'Chart tooltip',
          message: 'Bans',
        }),
        symbolSize: [6, 6],
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            color: colors.markLineColor,
          },
          data: [
            {
              yAxis: maxBanCount / 2,
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

  const { ref } = useChart({
    option,
  });

  return (
    <Panel
      header={
        <PanelTitle>
          <Trans>Ban count over time</Trans>
        </PanelTitle>
      }
    >
      {bansCount.length > 0 ? <div className="min-h-[400px]" ref={ref} /> : <NoBanMessage />}
    </Panel>
  );
}
