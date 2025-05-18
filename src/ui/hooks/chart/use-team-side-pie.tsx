import React from 'react';
import { renderToString } from 'react-dom/server';
import { useLingui } from '@lingui/react/macro';
import type { ChartOption } from 'csdm/ui/hooks/use-chart';
import { useChart } from 'csdm/ui/hooks/use-chart';
import { useChartColors } from 'csdm/ui/hooks/use-charts-colors';
import { getCssVariableValue } from 'csdm/ui/shared/get-css-variable-value';

type TeamSide = 'ct' | 't';

type Options = {
  valueCt: number;
  valueT: number;
  tooltipCt: string;
  tooltipT: string;
};

export function useTeamSidePie({ valueCt, valueT, tooltipCt, tooltipT }: Options) {
  const colors = useChartColors();
  const { t } = useLingui();

  const option: ChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: (parameters) => {
        const { data, percent } = parameters as {
          data: { name: TeamSide; value: number };
          percent: number;
        };
        const message = data.name === 'ct' ? tooltipCt : tooltipT;

        return renderToString(
          <div className="flex flex-col gap-y-4">
            <p>{message}</p>
            <p className="text-center">
              <span className="text-body-strong">{data.value}</span> ({percent}%)
            </p>
          </div>,
        );
      },
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
          formatter: (parameters) => {
            const { data, percent } = parameters as {
              data: { value: number; name: TeamSide };
              percent: number;
            };

            const side =
              data.name === 'ct'
                ? t({
                    message: 'CT',
                    context: 'Team side',
                  })
                : t({
                    message: 'T',
                    context: 'Team side',
                  });

            return `${side}\n${percent}%`;
          },
        },
        data: [
          {
            name: 'ct',
            value: valueCt,
            itemStyle: { color: getCssVariableValue('--color-ct') },
          },
          {
            name: 't',
            value: valueT,
            itemStyle: { color: getCssVariableValue('--color-terro') },
          },
        ],
      },
    ],
  };

  return useChart({
    option,
  });
}
