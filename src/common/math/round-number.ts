export function roundNumber(number: number, places?: number) {
  if (Number.isNaN(number)) {
    return 0;
  }

  if (places === undefined || places <= 0) {
    return Math.round(number);
  }

  const precision = Math.pow(10, places);
  return Math.round((number + Number.EPSILON) * precision) / precision;
}
