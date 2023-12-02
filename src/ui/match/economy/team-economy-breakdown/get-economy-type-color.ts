import { EconomyType } from 'csdm/common/types/counter-strike';
import { assertNever } from 'csdm/common/assert-never';

export function getEconomyTypeColor(type: EconomyType) {
  switch (type) {
    case EconomyType.Eco:
      return '#9256d9';
    case EconomyType.Pistol:
      return '#4646c6';
    case EconomyType.Semi:
      return '#1b959a';
    case EconomyType.ForceBuy:
      return '#78350f';
    case EconomyType.Full:
      return '#14532d';
    default:
      assertNever(type, `Unknown economy type: ${type}`);
  }
}
