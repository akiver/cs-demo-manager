import { PlayerColor } from 'csdm/common/types/counter-strike';

export function playerColorToString(color: PlayerColor) {
  const colors = {
    [PlayerColor.Grey]: 'Grey',
    [PlayerColor.Yellow]: 'Yellow',
    [PlayerColor.Purple]: 'Purple',
    [PlayerColor.Green]: 'Green',
    [PlayerColor.Blue]: 'Blue',
    [PlayerColor.Orange]: 'Orange',
  };

  return colors[color] ?? 'Grey';
}
