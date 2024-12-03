import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { renderToString } from 'react-dom/server';
import { useLocale } from 'csdm/ui/settings/ui/use-locale';
import type { ChartOption, ChartTextStyle } from 'csdm/ui/hooks/use-chart';
import { useChart } from 'csdm/ui/hooks/use-chart';
import { type PremierRank } from 'csdm/common/types/counter-strike';
import { useChartColors } from 'csdm/ui/hooks/use-charts-colors';
import { usePlayer } from '../use-player';
import { PremierRank as PremierRankLogo } from 'csdm/ui/components/premier-rank';
import { useGetWinCountTranslation } from './use-get-win-count-translation';

export function PlayerPremierRankHistory() {
  const { premierRankHistory } = usePlayer();
  const { t } = useLingui();
  const colors = useChartColors();
  const locale = useLocale();
  const getWinCountTranslation = useGetWinCountTranslation();
  const richConfig: { [tier: number]: ChartTextStyle } = {};

  const ranks = [0, 5000, 10000, 15000, 20000, 25000, 30000];
  for (const rank of ranks) {
    richConfig[rank] = {
      height: 30,
      width: 70,
      backgroundColor: {
        image: window.csdm.getPremierRankImageSrc(rank),
      },
    };
  }

  const option: ChartOption = {
    tooltip: {
      backgroundColor: colors.tooltipBackgroundColor,
      borderColor: colors.tooltipBorderColor,
      textStyle: {
        color: colors.tooltipTextColor,
      },
      formatter: (parameters) => {
        const { data } = parameters as unknown as {
          data: [matchDate: string, rank: PremierRank, winCount: number];
        };
        const [matchDate, rank, winCount] = data;

        const date = new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        }).format(new Date(matchDate));

        return renderToString(
          <div className="flex flex-col gap-y-4">
            <div className="self-center w-[64px]">
              <PremierRankLogo rank={rank} />
            </div>
            <div className="flex flex-col mt-8">
              <p>{getWinCountTranslation(winCount)}</p>
              <p>{date}</p>
            </div>
          </div>,
        );
      },
    },
    title: {
      text: t({
        context: 'Chart title',
        message: 'Premier mode rank history',
      }),
      left: 'center',
      textStyle: {
        color: colors.titleTextColor,
        fontWeight: 500,
      },
    },
    color: ['#5ba7fe'],
    xAxis: {
      type: 'time',
      name: t({
        context: 'Chart axis label',
        message: 'Date',
      }),
      axisLine: {
        show: true,
        lineStyle: {
          color: colors.axisColor,
        },
      },
      axisLabel: {
        formatter: (timestamp: number) => {
          return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          }).format(new Date(timestamp));
        },
      },
    },
    yAxis: {
      type: 'value',
      name: t({
        context: 'Chart axis label',
        message: 'Rank',
      }),
      axisLabel: {
        rich: richConfig,
        formatter: (value: number) => {
          if (ranks.includes(value)) {
            return '{' + value + '| }';
          }

          return value.toString();
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: colors.splitLineColor,
        },
      },
      axisLine: {
        lineStyle: {
          color: colors.axisColor,
        },
      },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: premierRankHistory.map((history) => {
          return [history.matchDate, history.rank, history.winCount];
        }),
        label: {
          show: true,
          color: colors.labelTextColor,
        },
      },
    ],
  };

  const { ref } = useChart({
    option,
  });

  return <div className="min-h-[600px]" ref={ref} />;
}
