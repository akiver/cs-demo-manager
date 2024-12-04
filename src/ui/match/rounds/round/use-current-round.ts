import { useParams } from 'react-router';
import { useCurrentMatch } from '../../use-current-match';

export function useCurrentRound() {
  const match = useCurrentMatch();
  const params = useParams<'number'>();
  const roundNumber = Number(params.number);
  const round = match.rounds.find((round) => round.number === roundNumber);
  if (round === undefined) {
    throw new Error(`Round number ${roundNumber} not found.`);
  }

  return round;
}
