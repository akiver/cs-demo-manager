import { getSettings } from 'csdm/node/settings/get-settings';

export function isValidSteamApiKey(key: unknown): key is string {
  return typeof key === 'string' && key !== '' && /^[a-zA-Z0-9]+$/.test(key);
}

export async function getSteamApiKey() {
  const { steamApiKey } = await getSettings();
  if (isValidSteamApiKey(steamApiKey)) {
    return steamApiKey;
  }

  const keys = process.env.STEAM_API_KEYS.split(',');

  return keys[Math.floor(Math.random() * keys.length)];
}
