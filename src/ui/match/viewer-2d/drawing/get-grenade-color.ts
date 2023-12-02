import { GrenadeName } from 'csdm/common/types/counter-strike';

export function getGrenadeColor(grenadeName: GrenadeName) {
  switch (grenadeName) {
    case GrenadeName.HE:
      return '#268e6c';
    case GrenadeName.Smoke:
      return '#737373';
    case GrenadeName.Flashbang:
      return '#f9a43f';
    case GrenadeName.Incendiary:
    case GrenadeName.Molotov:
      return '#da7b11';
    case GrenadeName.Decoy:
      return '#f76d74';
    default:
      return '#ffffff';
  }
}
