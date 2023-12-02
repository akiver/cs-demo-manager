export function getTeamScoreClassName(score: number, oppositeScore: number) {
  if (score === oppositeScore) {
    return 'text-blue-400';
  }

  return score > oppositeScore ? 'text-green-400' : 'text-red-400';
}
