export function getSequencePlayerColor(playerIndex: number) {
  const colors = [
    '#f7f52f',
    '#a01bef',
    '#04b462',
    '#fe9a28',
    '#5ba7fe',
    '#eb4b4b',
    '#e879f9',
    '#92400e',
    '#22d3ee',
    '#84cc16',
  ];

  return colors[playerIndex] ?? 'red';
}
