import { getCssVariableValue } from 'csdm/ui/shared/get-css-variable-value';

export function getTableRowHeight() {
  return Number.parseFloat(getCssVariableValue('--table-row-height'));
}
