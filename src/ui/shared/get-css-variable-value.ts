export function getCssVariableValue(variableName: string) {
  return window.getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}
