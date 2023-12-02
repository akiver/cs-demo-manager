import { PlayerColor } from 'csdm/common/types/counter-strike';

export function getPlayerColorBorderClassName(color: PlayerColor) {
  return {
    [PlayerColor.Grey]: 'border-cs-gray',
    [PlayerColor.Yellow]: 'border-cs-yellow',
    [PlayerColor.Purple]: 'border-cs-purple',
    [PlayerColor.Green]: 'border-cs-green',
    [PlayerColor.Blue]: 'border-cs-blue',
    [PlayerColor.Orange]: 'border-cs-orange',
  }[color];
}
