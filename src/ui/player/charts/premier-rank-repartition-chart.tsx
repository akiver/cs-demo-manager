import React from 'react';
import { renderToString } from 'react-dom/server';
import { useLingui } from '@lingui/react/macro';
import type { ChartOption } from 'csdm/ui/hooks/use-chart';
import { useChart } from 'csdm/ui/hooks/use-chart';
import { CompetitiveRank } from 'csdm/common/types/counter-strike';
import { usePlayer } from '../use-player';
import { useChartColors } from 'csdm/ui/hooks/use-charts-colors';
import { getPremierRankTier } from 'csdm/ui/shared/get-premier-rank-tier';
import { PremierRank } from 'csdm/ui/components/premier-rank';
import { useGetRankTierName } from 'csdm/ui/hooks/use-get-rank-tier-name';
import { getCssVariableValue } from 'csdm/ui/shared/get-css-variable-value';

export function PremierRankRepartitionChart() {
  const { enemyCountPerRank } = usePlayer();
  const colors = useChartColors();
  const getTierName = useGetRankTierName();
  const { t } = useLingui();

  const enemyCountPerPremierTier = new Map<number, number>();
  const data = [];

  for (const [rank, enemyCount] of Object.entries(enemyCountPerRank)) {
    if (enemyCount === 0) {
      continue;
    }

    const rankNumber = Number(rank);
    if (rankNumber <= CompetitiveRank.GlobalElite) {
      continue;
    }

    const tier = getPremierRankTier(rankNumber);
    enemyCountPerPremierTier.set(tier, (enemyCountPerPremierTier.get(tier) ?? 0) + enemyCount);
  }

  for (const [tier, enemyCount] of enemyCountPerPremierTier) {
    const varName = tier === CompetitiveRank.Unknown ? '--cs-rating-tier-unknown' : `--cs-rating-tier-${tier}`;
    data.push({
      name: `tier-${tier}`,
      value: enemyCount,
      tier,
      itemStyle: { color: getCssVariableValue(varName) },
    });
  }

  data.sort((enemyCountA, enemyCountB) => enemyCountA.value - enemyCountB.value);

  const option: ChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: (parameters) => {
        const { data, percent } = parameters as unknown as {
          data: { value: number; tier: string };
          percent: number;
        };

        const tier = Number(data.tier);

        return renderToString(
          <div className="flex flex-col gap-y-4">
            <div className="self-center w-[64px]">
              <PremierRank rank={tier * 1000 * 5} />
            </div>
            <p>{getTierName(tier)}</p>
            <div className="flex gap-x-4">
              <p className="text-body-strong">{data.value}</p>
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
        message: 'Players Premier rank repartition',
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
              data: { tier: number };
            };
            const name = getTierName(data.tier);

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

  return <div className="min-h-[400px] w-full" ref={ref} />;
}
