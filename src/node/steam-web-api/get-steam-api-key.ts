import { getSettings } from 'csdm/node/settings/get-settings';

export async function getSteamApiKey() {
  const { steamApiKey } = await getSettings();
  if (typeof steamApiKey === 'string' && steamApiKey !== '') {
    return steamApiKey;
  }

  const keys = process.env.STEAM_API_KEYS.split(',');

  return keys[Math.floor(Math.random() * keys.length)];
}
