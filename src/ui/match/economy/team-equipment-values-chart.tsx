import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ChartOption } from 'csdm/ui/hooks/use-chart';
import { useChart } from 'csdm/ui/hooks/use-chart';
import { useCurrentMatch } from '../use-current-match';
import { Panel, PanelTitle } from 'csdm/ui/components/panel';
import { useChartColors } from 'csdm/ui/hooks/use-charts-colors';

export function TeamEquipmentValuesChart() {
  const match = useCurrentMatch();
  const colors = useChartColors();
  const { t } = useLingui();

  const roundsNumber = match.rounds.map((round) => {
    return round.number;
  });

  const roundsWinnerName = match.rounds.map((round) => {
    return round.winnerTeamName;
  });

  const teamAStartMoneys = match.rounds.map((round) => {
    return round.teamAStartMoney;
  });

  const teamBStartMoneys = match.rounds.map((round) => {
    return round.teamBStartMoney;
  });

  const teamNameA: string = match.teamA.name;
  const teamNameB: string = match.teamB.name;

  const option: ChartOption = {
    grid: {
      top: 60,
      bottom: 30,
    },
    color: [colors.teamA, colors.teamB],
    tooltip: {
      trigger: 'axis',
      backgroundColor: colors.tooltipBackgroundColor,
      borderColor: colors.tooltipBorderColor,
      textStyle: {
        color: colors.tooltipTextColor,
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
    },
    legend: {
      data: [
        {
          name: teamNameA,
          textStyle: {
            color: colors.legendTextColor,
          },
        },
        {
          name: teamNameB,
          textStyle: {
            color: colors.legendTextColor,
          },
        },
      ],
    },
    xAxis: [
      {
        type: 'category',
        name: t({
          message: 'Round',
          context: 'Chart axis label',
        }),
        axisLine: {
          lineStyle: {
            color: colors.axisColor,
          },
        },
        axisPointer: {
          label: {
            formatter: ({ value: roundNumber }) => {
              return t({
                message: `Round ${roundNumber}`,
                context: 'Chart axis tooltip',
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
          context: 'Chart label',
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
        data: roundsWinnerName,
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: '$',
        axisLine: {
          onZero: false,
          lineStyle: {
            color: colors.axisColor,
          },
        },
        axisLabel: {
          color: colors.axisColor,
        },
      },
    ],
    series: [
      {
        name: teamNameA,
        stack: teamNameA,
        type: 'line',
        data: teamAStartMoneys,
      },
      {
        name: teamNameB,
        type: 'line',
        stack: teamNameB,
        data: teamBStartMoneys,
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
          <Trans>Equipment value</Trans>
        </PanelTitle>
      }
    >
      <div className="min-h-[400px]" ref={ref} />
    </Panel>
  );
}
