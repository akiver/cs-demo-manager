import React from 'react';
import type { ChartOption } from 'csdm/ui/hooks/use-chart';
import { useChart } from 'csdm/ui/hooks/use-chart';
import { useCurrentMatch } from '../use-current-match';
import { Panel, PanelTitle } from 'csdm/ui/components/panel';
import { useChartColors } from 'csdm/ui/hooks/use-charts-colors';
import { Trans, useLingui } from '@lingui/react/macro';
import { useFormatMoney } from 'csdm/ui/hooks/use-format-money';

export function TeamEconomyAdvantageChart() {
  const { t } = useLingui();
  const match = useCurrentMatch();
  const colors = useChartColors();
  const formatMoney = useFormatMoney();
  const roundsNumber = match.rounds.map((round) => {
    return round.number;
  });

  const winners = match.rounds.map((round) => {
    return round.winnerTeamName;
  });

  const teamAData = match.rounds.map((round) => {
    if (round.teamAStartMoney >= round.teamBStartMoney) {
      return round.teamAStartMoney - round.teamBStartMoney;
    }
    return 0;
  });

  const teamBData = match.rounds.map((round) => {
    if (round.teamBStartMoney >= round.teamAStartMoney) {
      return round.teamAStartMoney - round.teamBStartMoney;
    }
    return 0;
  });

  const option: ChartOption = {
    grid: {
      top: 60,
      bottom: 30,
    },
    color: [colors.teamA, colors.teamB],
    legend: {
      data: [
        {
          name: match.teamA.name,
          textStyle: {
            color: colors.legendTextColor,
          },
        },
        {
          name: match.teamB.name,
          textStyle: {
            color: colors.legendTextColor,
          },
        },
      ],
    },
    tooltip: {
      backgroundColor: colors.tooltipBackgroundColor,
      borderColor: colors.tooltipBorderColor,
      textStyle: {
        color: colors.legendTextColor,
      },
      axisPointer: {
        type: 'cross',
        label: {
          color: colors.tooltipTextColor,
          backgroundColor: colors.tooltipBackgroundColor,
          borderColor: colors.tooltipBorderColor,
          borderWidth: 1,
        },
      },
      formatter: (params) => {
        const { seriesName: teamName, value } = params as { seriesName: string; value: number };
        const oppositeTeamName = teamName === match.teamB.name ? match.teamA.name : match.teamB.name;
        const money = formatMoney(Math.abs(value));
        return t({
          message: `${teamName} has +${money} more than ${oppositeTeamName}`,
          context: 'Chart tooltip',
        });
      },
    },
    xAxis: [
      {
        type: 'category',
        name: t({
          message: 'Round',
          context: 'Chart axis label',
        }),
        axisLine: {
          onZero: false,
          lineStyle: {
            color: colors.axisColor,
          },
        },
        axisPointer: {
          label: {
            formatter: ({ value: roundNumber }) => {
              return t({
                message: `Round ${roundNumber}`,
                context: 'Chart tooltip',
              });
            },
          },
        },
        data: roundsNumber,
      },
      {
        type: 'category',
        name: t({
          message: 'Winner',
          context: 'Chart axis label',
        }),
        axisLine: {
          onZero: false,
          lineStyle: {
            color: colors.axisColor,
          },
        },
        axisPointer: {
          label: {
            formatter: ({ value: winnerName }) => {
              return t({
                message: `Winner: ${winnerName}`,
                context: 'Chart tooltip',
              });
            },
          },
        },
        data: winners,
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: '$',
        axisLine: {
          lineStyle: {
            color: colors.axisColor,
          },
        },
        axisLabel: {
          color: colors.axisColor,
          formatter: (value: number) => {
            return `${value === 0 ? '' : '+'}${Math.abs(value)}`;
          },
        },
      },
    ],
    series: [
      {
        name: match.teamA.name,
        type: 'bar',
        data: teamAData,
        stack: 'two',
      },
      {
        name: match.teamB.name,
        type: 'bar',
        data: teamBData,
        stack: 'two',
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
          <Trans>Advantage</Trans>
        </PanelTitle>
      }
    >
      <div className="min-h-[400px]" ref={ref} />
    </Panel>
  );
}
