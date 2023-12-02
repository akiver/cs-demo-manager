import { getSettings } from 'csdm/node/settings/get-settings';

export async function getSteamApiKey() {
  const { steamApiKey } = await getSettings();
  if (typeof steamApiKey === 'string' && steamApiKey !== '') {
    return steamApiKey;
  }

  return process.env.STEAM_API_KEY;
}
