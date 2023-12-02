import { assertNever } from 'csdm/common/assert-never';
import { dateToUnixTimestamp } from 'csdm/common/date/date-to-unix-timestamp';
import { getDateFirstDay } from 'csdm/common/date/get-date-first-day';
import { getDateFirstMonth } from 'csdm/common/date/get-date-first-month';
import { getDateTimestampAtMidnight } from 'csdm/common/date/get-date-timestamp-at-midnight';
import { roundNumber } from 'csdm/common/math/round-number';
import type { PlayerChartDataField, PlayerChartsData } from 'csdm/common/types/charts/player-charts-data';
import type { Axis } from './x-axis';

type ValuePerTimestamp = {
  [timestamp: string]: number;
};

function computeValuesAverage(percentageA: number, percentageB: number) {
  return roundNumber((percentageA + percentageB) / 2, 1);
}

type BuilderOptions = {
  field: PlayerChartDataField;
  chartsData: PlayerChartsData[];
  axis: Axis;
};

/**
 * Compute a given player's stat average over time and return data for a chart instance.
 * It's a cumulative average, for example computing the HS% of a player per day whom had the following %:
 * The 1st of January: 70%
 * The 2nd of January: 10%
 * The 3rd of January: 50%
 *
 * Will display on the chart:
 * The 1st of January: 70%
 * The 2nd of January: 40% (70 + 10) / 2
 * The 3rd of January: 45% (40 + 50) / 2
 *
 * Values are rounded to 1 decimal.
 * */
export function buildAveragePlayerChartData({ field, chartsData, axis }: BuilderOptions) {
  const valuePerTimestamp: ValuePerTimestamp = {};
  for (let i = 0; i < chartsData.length; i++) {
    const chartData = chartsData[i];
    const matchDate = new Date(chartData.matchDate);

    let timestamp: number;
    switch (axis) {
      case 'match':
        timestamp = dateToUnixTimestamp(matchDate);
        break;
      case 'day':
        timestamp = getDateTimestampAtMidnight(matchDate);
        break;
      case 'month': {
        const firstDay = getDateFirstDay(matchDate);
        timestamp = dateToUnixTimestamp(firstDay);
        break;
      }
      case 'year': {
        const firstMonth = getDateFirstMonth(matchDate);
        timestamp = dateToUnixTimestamp(firstMonth);
        break;
      }
      default:
        assertNever(axis, `Unsupported axis: ${axis}`);
    }

    const value = chartData[field];
    if (Object.keys(valuePerTimestamp).length === 0 || axis === 'match') {
      valuePerTimestamp[timestamp] = roundNumber(value, 1);
      continue;
    }

    const previousChartData: PlayerChartsData = chartsData[i - 1];
    const previousMatchDate = new Date(previousChartData.matchDate);
    let previousMatchTimestamp: number;
    switch (axis) {
      case 'day':
        previousMatchTimestamp = getDateTimestampAtMidnight(previousMatchDate);
        break;
      case 'month': {
        const previousMatchFirstDay = getDateFirstDay(previousMatchDate);
        previousMatchTimestamp = dateToUnixTimestamp(previousMatchFirstDay);
        break;
      }
      case 'year': {
        const firstMonth = getDateFirstMonth(previousMatchDate);
        previousMatchTimestamp = dateToUnixTimestamp(firstMonth);
        break;
      }
    }

    valuePerTimestamp[timestamp] =
      previousMatchTimestamp === timestamp
        ? computeValuesAverage(valuePerTimestamp[timestamp], value)
        : computeValuesAverage(valuePerTimestamp[previousMatchTimestamp], value);
  }

  const data: [string, number][] = [...Object.entries(valuePerTimestamp)];

  return data;
}
