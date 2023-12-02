import { roundNumber } from './round-number';

export function roundNumberPercentage(number: number, places?: number) {
  if (Number.isNaN(number)) {
    return 0;
  }

  return roundNumber(number * 100, places);
}
