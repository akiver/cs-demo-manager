import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useTeam } from 'csdm/ui/team/use-team';
import { TeamChart, TeamChartPanel, TeamChartPanelHeader } from 'csdm/ui/team/performance/team-chart-panel';
import { useChart, type ChartOption } from 'csdm/ui/hooks/use-chart';
import { useChartColors } from 'csdm/ui/hooks/use-charts-colors';
import { getCssVariableValue } from 'csdm/ui/shared/get-css-variable-value';
import { renderToString } from 'react-dom/server';

type PieFormatterParams = {
  percent: number;
  value: string;
  name: string;
};

function tooltipFormatter(parameters: PieFormatterParams): string {
  const { percent, value, name } = parameters;
  return renderToString(
    <div className="flex flex-col gap-y-4">
      <p>{name}</p>
      <p className="text-center">
        <span className="text-body-strong">{value}</span> ({percent}%)
      </p>
    </div>,
  );
}

function labelFormatter(parameters: PieFormatterParams): string {
  const { percent, name } = parameters;
  return `${name}\n${percent}%`;
}

type ChartData = Array<{
  name: string;
  value: number;
  itemStyle: { color: string };
}>;

type ChartColors = ReturnType<typeof useChartColors>;

function buildChartOption({ colors, data }: { colors: ChartColors; data: ChartData }): ChartOption {
  return {
    tooltip: {
      trigger: 'item',
      formatter: tooltipFormatter as unknown as string,
      backgroundColor: colors.tooltipBackgroundColor,
      borderColor: colors.tooltipBorderColor,
      textStyle: {
        color: colors.tooltipTextColor,
      },
    },
    series: [
      {
        type: 'pie',
        percentPrecision: 0,
        label: {
          color: colors.labelTextColor,
          fontSize: 16,
          formatter: labelFormatter as unknown as string,
        },
        data,
      },
    ],
  };
}

export function TeamBombPlantRoundOutcomeChart() {
  const { bombsStats } = useTeam();
  const colors = useChartColors();
  const { t } = useLingui();

  const data: ChartData = [
    {
      name: t({
        message: 'Won due to bomb explosion',
        context: 'Chart axis label',
      }),
      value: bombsStats.roundsWonDueToBombExplosion,
      itemStyle: { color: getCssVariableValue('--color-green-500') },
    },
    {
      name: t({
        message: 'Lost due to defusal',
        context: 'Chart axis label',
      }),
      value: bombsStats.roundsLostDueToDefusal,
      itemStyle: { color: getCssVariableValue('--color-red-500') },
    },
    {
      name: t({
        message: 'Won due to player deaths',
        context: 'Chart axis label',
      }),
      value: bombsStats.roundsWonByPlayerDeaths,
      itemStyle: { color: getCssVariableValue('--color-blue-500') },
    },
  ];

  const option = buildChartOption({ colors, data });
  const { ref } = useChart({ option });

  return (
    <TeamChartPanel>
      <TeamChartPanelHeader
        title={<Trans context="Chart title">Bomb plant round outcome</Trans>}
        tooltip={<Trans context="Tooltip">Round outcome when the bomb was planted by the team</Trans>}
      />
      <TeamChart ref={ref} />
    </TeamChartPanel>
  );
}

export function TeamEnemyBombPlantRoundOutcomeChart() {
  const { bombsStats } = useTeam();
  const colors = useChartColors();
  const { t } = useLingui();

  const data: ChartData = [
    {
      name: t({
        message: 'Won due to defusal',
        context: 'Chart axis label',
      }),
      value: bombsStats.roundsWonDueToDefusal,
      itemStyle: { color: getCssVariableValue('--color-green-500') },
    },
    {
      name: t({
        message: 'Lost due to bomb explosion',
        context: 'Chart axis label',
      }),
      value: bombsStats.roundsLostDueToBombExplosion,
      itemStyle: { color: getCssVariableValue('--color-red-500') },
    },
    {
      name: t({
        message: 'Lost due to player deaths',
        context: 'Chart axis label',
      }),
      value: bombsStats.roundsLostDueToPlayerDeaths,
      itemStyle: { color: getCssVariableValue('--color-orange-500') },
    },
  ];

  const option = buildChartOption({ colors, data });
  const { ref } = useChart({ option });

  return (
    <TeamChartPanel>
      <TeamChartPanelHeader
        title={<Trans context="Chart title">Enemy bomb plant round outcome</Trans>}
        tooltip={<Trans context="Tooltip">Round outcome when the bomb was planted by the enemy team</Trans>}
      />
      <TeamChart ref={ref} />
    </TeamChartPanel>
  );
}
