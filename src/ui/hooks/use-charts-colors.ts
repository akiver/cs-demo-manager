import { useCssVariableValue } from './use-css-variable-value';

export function useChartColors() {
  const labelTextColor = useCssVariableValue('--gray-800');
  const legendTextColor = useCssVariableValue('--gray-800');
  const titleTextColor = useCssVariableValue('--gray-800');
  const tooltipBackgroundColor = useCssVariableValue('--gray-75');
  const tooltipTextColor = useCssVariableValue('--gray-800');
  const tooltipBorderColor = useCssVariableValue('--gray-300');
  const seriesBackgroundColor = useCssVariableValue('--gray-300');
  const axisColor = useCssVariableValue('--gray-800');
  const splitLineColor = useCssVariableValue('--gray-300');
  const markLineColor = useCssVariableValue('--gray-300');
  const redColor = useCssVariableValue('--red-700');
  const greenColor = useCssVariableValue('--green-700');

  return {
    labelTextColor,
    legendTextColor,
    titleTextColor,
    tooltipBackgroundColor,
    tooltipTextColor,
    tooltipBorderColor,
    seriesBackgroundColor,
    axisColor,
    splitLineColor,
    markLineColor,
    redColor,
    greenColor,
    teamA: '#dfbf00',
    teamB: '#6767ec',
  };
}
