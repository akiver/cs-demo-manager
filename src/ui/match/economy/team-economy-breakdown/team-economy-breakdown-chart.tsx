import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { RoundEndReason, type EconomyType } from 'csdm/common/types/counter-strike';
import { TeamEconomyCards } from './team-economy-cards';
import { useTranslateEconomyType } from './use-translate-economy-type';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { getEconomyTypeColor } from './get-economy-type-color';
import type {
  ChartOption,
  GridComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
  TooltipComponentOption,
} from 'csdm/ui/hooks/use-chart';
import { useChart } from 'csdm/ui/hooks/use-chart';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { EliminationIcon } from 'csdm/ui/icons/elimination-icon';
import { DefuserIcon } from 'csdm/ui/icons/weapons/defuser-icon';
import { Panel, PanelTitle } from 'csdm/ui/components/panel';
import { useChartColors } from 'csdm/ui/hooks/use-charts-colors';
import { getTeamColor } from 'csdm/ui/styles/get-team-color';
import { BombIcon } from 'csdm/ui/icons/weapons/bomb-icon';
import { useFormatMoney } from 'csdm/ui/hooks/use-format-money';

type EconomyChartData = {
  value: number;
  economyType: EconomyType;
};

const grid: GridComponentOption = {
  top: 35,
  bottom: 35,
};

export function TeamsEconomyBreakdownChart() {
  const colors = useChartColors();
  const match = useCurrentMatch();
  const { translateEconomyType } = useTranslateEconomyType();
  const formatMoney = useFormatMoney();
  const { t } = useLingui();
  const teamAData: EconomyChartData[] = match.rounds.map((round) => {
    return {
      value: round.teamAEquipmentValue,
      economyType: round.teamAEconomyType,
    };
  });
  const teamBData: EconomyChartData[] = match.rounds.map((round) => {
    return {
      value: round.teamBEquipmentValue,
      economyType: round.teamBEconomyType,
    };
  });
  const roundsNumber = [...match.rounds].reverse().map((round) => round.number);

  const barStyle = {
    color: ({ data }: { data: EconomyChartData }) => {
      return getEconomyTypeColor(data.economyType);
    },
  };

  const xAxis: XAXisComponentOption = {
    type: 'value',
    nameTextStyle: {
      color: colors.axisColor,
    },
    axisLabel: {
      color: colors.axisColor,
      formatter: (equipmentValue: number) => {
        const money = equipmentValue / 1000;
        return t({
          context: 'Chart axis label money value',
          message: `${money}K`,
        });
      },
    },
  };

  const yAxis: YAXisComponentOption = {
    type: 'category',
    name: t({
      context: 'Chart axis label',
      message: 'Round',
    }),
    nameTextStyle: {
      color: colors.axisColor,
    },
    data: roundsNumber,
    axisLabel: {
      color: colors.axisColor,
    },
  };

  const label = {
    show: true,
    color: '#fff',
    position: 'insideLeft' as const,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatter: (params: any) => {
      const data = params.data as EconomyChartData;
      return formatMoney(data.value);
    },
  };

  const tooltip: TooltipComponentOption = {
    backgroundColor: colors.tooltipBackgroundColor,
    borderColor: colors.tooltipBorderColor,
    textStyle: {
      color: colors.tooltipTextColor,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatter: (params: any) => {
      const {
        seriesName: teamName,
        value: money,
        data,
        marker,
        name: roundNumber,
      } = params as {
        seriesName: string;
        value: number;
        dataIndex: number;
        data: EconomyChartData;
        marker: string;
        name: string;
      };
      const type = translateEconomyType(data.economyType);
      const moneyValue = formatMoney(money);

      const round = t({
        context: 'Chart tooltip',
        message: `Round: ${roundNumber}`,
      });
      const economyType = t({
        context: 'Chart tooltip economy type',
        message: `Type: ${type}`,
      });
      const equipmentValue = t({
        context: 'Chart tooltip',
        message: `Equipment value: ${moneyValue}`,
      });

      // eslint-disable-next-line lingui/no-unlocalized-strings
      return `${teamName}<br />${round}<br />${economyType} ${marker}<br />${equipmentValue}`;
    },
  };

  const chartOptionTeamA: ChartOption = {
    grid: {
      ...grid,
      right: 35,
    },
    tooltip,
    xAxis: {
      ...xAxis,
      inverse: true,
    },
    yAxis: {
      ...yAxis,
      position: 'right',
    },
    // @ts-ignore Bad lib type
    series: [
      {
        name: match.teamA.name,
        type: 'bar',
        data: teamAData.toReversed(),
        label,
        itemStyle: barStyle,
      },
    ],
  };

  const chartOptionTeamB: ChartOption = {
    grid: {
      ...grid,
      left: 35,
    },
    tooltip,
    xAxis,
    yAxis,
    // @ts-ignore Bad lib type
    series: [
      {
        name: match.teamB.name,
        type: 'bar',
        data: teamBData.toReversed(),
        label,
        itemStyle: barStyle,
      },
    ],
  };

  const { ref: chartRefTeamA } = useChart({
    option: chartOptionTeamA,
  });
  const { ref: chartRefTeamB } = useChart({
    option: chartOptionTeamB,
  });
  const style = { height: match.rounds.length * 35, minWidth: 700 };

  return (
    <Panel
      header={
        <PanelTitle>
          <Trans>Breakdown</Trans>
        </PanelTitle>
      }
    >
      <TeamEconomyCards />
      <div className="flex justify-center">
        <div ref={chartRefTeamA} style={style} />
        <div className="flex flex-col justify-around my-[38px]">
          {match.rounds.map((round) => {
            let Icon = EliminationIcon;
            switch (round.endReason) {
              case RoundEndReason.BombDefused:
                Icon = DefuserIcon;
                break;
              case RoundEndReason.TargetBombed:
                Icon = BombIcon;
            }
            const iconColor = getTeamColor(round.winnerSide);
            const winnerTeamName = round.winnerTeamName;
            const isWinnerTeamA = winnerTeamName === match.teamA.name;
            const roundNumber = round.number;

            return (
              <div
                className="flex w-[50px]"
                key={round.number}
                style={{
                  justifyContent: isWinnerTeamA ? 'flex-start' : 'flex-end',
                }}
              >
                <Tooltip
                  content={
                    <Trans context="Chart tooltip">
                      {winnerTeamName} won the round {roundNumber}
                    </Trans>
                  }
                  delay={100}
                >
                  <div>
                    <Icon color={iconColor} width={20} />
                  </div>
                </Tooltip>
              </div>
            );
          })}
        </div>
        <div ref={chartRefTeamB} style={style} />
      </div>
    </Panel>
  );
}
