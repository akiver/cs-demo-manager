import { useParams } from 'react-router-dom';

export function useCurrentPlayerSteamId() {
  const { steamId } = useParams<'steamId'>();
  if (typeof steamId !== 'string') {
    throw new TypeError('steamId is not a string');
  }

  return steamId;
}
