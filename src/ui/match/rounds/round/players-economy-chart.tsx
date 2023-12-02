import React from 'react';
import type { ChartOption } from 'csdm/ui/hooks/use-chart';
import type { BarSeriesOption } from 'csdm/ui/hooks/use-chart';
import { useChart } from 'csdm/ui/hooks/use-chart';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useCurrentRound } from './use-current-round';
import { Panel } from 'csdm/ui/components/panel';
import { useChartColors } from 'csdm/ui/hooks/use-charts-colors';

function useEconomySeriesData() {
  const match = useCurrentMatch();
  const round = useCurrentRound();
  const playerNamesTeamA: string[] = [];
  const cashDataTeamA: number[] = [];
  const cashSpentDataTeamA: number[] = [];
  const equipmentValueDataTeamA: number[] = [];
  const playerNamesTeamB: string[] = [];
  const cashDataTeamB: number[] = [];
  const cashSpentDataTeamB: number[] = [];
  const equipmentValueDataTeamB: number[] = [];

  for (const player of match.players) {
    const playerEconomy = match.playersEconomies.find((playerEconomy) => {
      return playerEconomy.roundNumber === round.number && playerEconomy.playerSteamId === player.steamId;
    });
    if (playerEconomy === undefined) {
      continue;
    }

    if (player.teamName === match.teamA.name) {
      playerNamesTeamA.push(player.name);
      cashDataTeamA.push(playerEconomy.startMoney);
      cashSpentDataTeamA.push(playerEconomy.moneySpent);
      equipmentValueDataTeamA.push(playerEconomy.equipmentValue);
    } else {
      playerNamesTeamB.push(player.name);
      cashDataTeamB.push(playerEconomy.startMoney);
      cashSpentDataTeamB.push(playerEconomy.moneySpent);
      equipmentValueDataTeamB.push(playerEconomy.equipmentValue);
    }
  }

  const max = Math.max(
    ...cashDataTeamA,
    ...cashDataTeamB,
    ...cashSpentDataTeamA,
    ...cashSpentDataTeamB,
    ...equipmentValueDataTeamA,
    ...equipmentValueDataTeamB,
  );

  return {
    playerNamesTeamA,
    playerNamesTeamB,
    cashDataTeamA,
    cashDataTeamB,
    cashSpentDataTeamA,
    cashSpentDataTeamB,
    equipmentValueDataTeamA,
    equipmentValueDataTeamB,
    max,
  };
}

function useEconomyChartOption() {
  const colors = useChartColors();
  const match = useCurrentMatch();
  const {
    playerNamesTeamA,
    playerNamesTeamB,
    cashDataTeamA,
    cashDataTeamB,
    cashSpentDataTeamA,
    cashSpentDataTeamB,
    equipmentValueDataTeamA,
    equipmentValueDataTeamB,
    max,
  } = useEconomySeriesData();

  const label = {
    show: true,
    color: colors.labelTextColor,
  };

  const commonOption: ChartOption = {
    color: ['#12805c', '#0d66d0', '#cb6f10'],
    title: {
      textStyle: {
        color: colors.titleTextColor,
        fontWeight: 500,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none',
      },
      backgroundColor: colors.tooltipBackgroundColor,
      borderColor: colors.tooltipBorderColor,
      textStyle: {
        color: colors.tooltipTextColor,
      },
    },
    legend: {
      top: 'bottom',
      textStyle: {
        color: colors.legendTextColor,
      },
    },
    xAxis: {
      type: 'value',
      max,
      name: '$',
      axisLabel: label,
      nameTextStyle: {
        color: colors.axisColor,
      },
      splitLine: {
        lineStyle: {
          color: colors.splitLineColor,
        },
      },
    },
    yAxis: {
      type: 'category',
      axisLabel: label,
      axisLine: {
        lineStyle: {
          color: colors.axisColor,
        },
      },
    },
  };

  const barSeries: BarSeriesOption = {
    type: 'bar',
    label,
    emphasis: {
      focus: 'series',
    },
  };

  const cashSeries: BarSeriesOption = {
    ...barSeries,
    name: 'Cash',
  };

  const cashSpentSeries: BarSeriesOption = {
    ...barSeries,
    name: 'Cash spent',
  };

  const equipmentValueSeries: BarSeriesOption = {
    ...barSeries,
    name: 'Equipment value',
  };

  const labelTeamA = {
    ...label,
    position: 'left' as const,
  };

  const chartOptionTeamA: ChartOption = {
    ...commonOption,
    title: {
      ...commonOption.title,
      text: match.teamA.name,
      left: 0,
    },
    xAxis: {
      ...commonOption.xAxis,
      inverse: true,
    },
    yAxis: {
      ...commonOption.yAxis,
      type: 'category',
      position: 'right',
      data: playerNamesTeamA,
    },
    series: [
      {
        ...cashSeries,
        label: labelTeamA,
        data: cashDataTeamA,
      },
      {
        ...cashSpentSeries,
        label: labelTeamA,
        data: cashSpentDataTeamA,
      },
      {
        ...equipmentValueSeries,
        label: labelTeamA,
        data: equipmentValueDataTeamA,
      },
    ],
  };

  const labelTeamB = {
    ...cashSeries.label,
    position: 'right' as const,
  };

  const chartOptionTeamB: ChartOption = {
    ...commonOption,
    title: {
      ...commonOption.title,
      text: match.teamB.name,
      right: 0,
    },
    yAxis: {
      ...commonOption.yAxis,
      position: 'left',
      type: 'category',
      data: playerNamesTeamB,
    },
    series: [
      {
        ...cashSeries,
        label: labelTeamB,
        data: cashDataTeamB,
      },
      {
        ...cashSpentSeries,
        label: labelTeamB,
        data: cashSpentDataTeamB,
      },
      {
        ...equipmentValueSeries,
        label: labelTeamB,
        data: equipmentValueDataTeamB,
      },
    ],
  };

  const chartHeightTeamA = playerNamesTeamA.length * 100;
  const chartHeightTeamB = playerNamesTeamB.length * 100;

  return {
    chartOptionTeamA,
    chartOptionTeamB,
    chartHeightTeamA,
    chartHeightTeamB,
  };
}

export function PlayersEconomyChart() {
  const { chartOptionTeamA, chartOptionTeamB, chartHeightTeamA, chartHeightTeamB } = useEconomyChartOption();
  const { ref: chartRefTeamA } = useChart({ option: chartOptionTeamA });
  const { ref: chartRefTeamB } = useChart({ option: chartOptionTeamB });

  return (
    <Panel header="Teams economy">
      <div className="flex">
        <div
          className="w-1/2"
          style={{
            height: chartHeightTeamA,
          }}
          ref={chartRefTeamA}
        />
        <div
          className="w-1/2"
          style={{
            height: chartHeightTeamB,
          }}
          ref={chartRefTeamB}
        />
      </div>
    </Panel>
  );
}
