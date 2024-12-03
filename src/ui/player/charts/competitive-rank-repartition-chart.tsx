import React from 'react';
import { renderToString } from 'react-dom/server';
import { useLingui } from '@lingui/react/macro';
import type { ChartOption } from 'csdm/ui/hooks/use-chart';
import { useChart } from 'csdm/ui/hooks/use-chart';
import { CompetitiveRank } from 'csdm/common/types/counter-strike';
import { usePlayer } from '../use-player';
import { useChartColors } from 'csdm/ui/hooks/use-charts-colors';
import { useGetRankName } from 'csdm/ui/hooks/use-get-rank-name';

export function CompetitiveRankRepartitionChart() {
  const { enemyCountPerRank } = usePlayer();
  const getRankName = useGetRankName();
  const colors = useChartColors();
  const { t } = useLingui();

  const rankColors: Record<CompetitiveRank, string> = {
    [CompetitiveRank.Unknown]: '#c7c7c7',
    [CompetitiveRank.SilverI]: '#F472B6',
    [CompetitiveRank.SilverII]: '#EC4899',
    [CompetitiveRank.SilverIII]: '#DB2777',
    [CompetitiveRank.SilverIV]: '#BE185D',
    [CompetitiveRank.SilverElite]: '#9D174D',
    [CompetitiveRank.SilverEliteMaster]: '#831843',
    [CompetitiveRank.GoldNovaI]: '#7C3AED',
    [CompetitiveRank.GoldNovaII]: '#6D28D9',
    [CompetitiveRank.GoldNovaIII]: '#5B21B6',
    [CompetitiveRank.GoldNovaMaster]: '#4C1D95',
    [CompetitiveRank.MasterGuardianI]: '#4338CA',
    [CompetitiveRank.MasterGuardianII]: '#3730A3',
    [CompetitiveRank.MasterGuardianElite]: '#312E81',
    [CompetitiveRank.DistinguishedMasterGuardian]: '#F59E0B',
    [CompetitiveRank.LegendaryEagle]: '#D97706',
    [CompetitiveRank.LegendaryEagleMaster]: '#B45309',
    [CompetitiveRank.SupremeMasterFirstClass]: '#92400E',
    [CompetitiveRank.GlobalElite]: '#78350F',
  };

  const enemyCountPerCompetitiveRank = new Map<CompetitiveRank, number>();
  const data = [];

  for (const [rank, enemyCount] of Object.entries(enemyCountPerRank)) {
    if (enemyCount === 0) {
      continue;
    }

    const rankNumber = Number(rank) as CompetitiveRank;
    if (rankNumber > CompetitiveRank.GlobalElite) {
      continue;
    }

    enemyCountPerCompetitiveRank.set(rankNumber, enemyCount);

    data.push({
      name: `rank-${rankNumber}`,
      value: enemyCount,
      rankNumber,
      itemStyle: { color: rankColors[rankNumber] },
    });
  }

  data.sort((enemyCountA, enemyCountB) => enemyCountA.value - enemyCountB.value);

  const option: ChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: (parameters) => {
        const { data, percent } = parameters as unknown as {
          data: { value: number; rankNumber: number };
          percent: number;
        };
        const { rankNumber, value } = data;

        return renderToString(
          <div className="flex flex-col gap-y-4">
            <img src={window.csdm.getRankImageSrc(rankNumber)} className="self-center w-[64px]" />
            <p>{getRankName(rankNumber)}</p>
            <div className="flex gap-x-4">
              <p className="text-body-strong">{value}</p>
              <p>({percent}%)</p>
            </div>
          </div>,
        );
      },
      backgroundColor: colors.tooltipBackgroundColor,
      borderColor: colors.tooltipBorderColor,
      textStyle: {
        color: colors.tooltipTextColor,
      },
    },
    title: {
      text: t({
        message: 'Players competitive rank repartition',
        context: 'Chart title',
      }),
      left: 'center',
      textStyle: {
        color: colors.titleTextColor,
        fontWeight: 500,
      },
    },
    series: [
      {
        type: 'pie',
        label: {
          color: colors.labelTextColor,
          fontSize: 12,
          formatter: (parameters) => {
            const { data } = parameters as unknown as {
              data: { rankNumber: number };
            };
            const name = getRankName(Number(data.rankNumber));
            return `${name}: ${parameters.percent}%`;
          },
        },
        data,
      },
    ],
  };

  const { ref } = useChart({
    option,
  });

  return <div className="w-full min-h-[400px]" ref={ref} />;
}
