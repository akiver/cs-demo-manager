import { useParams } from 'react-router-dom';

export function useCurrentTeamName() {
  const { name } = useParams<'name'>();
  if (typeof name !== 'string') {
    throw new TypeError('team name is not a string');
  }

  return name;
}
