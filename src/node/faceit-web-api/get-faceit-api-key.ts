import { getSettings } from 'csdm/node/settings/get-settings';

export async function getFaceitApiKey(): Promise<string> {
  const { faceitApiKey } = await getSettings();
  if (faceitApiKey !== '') {
    return faceitApiKey;
  }

  return process.env.FACEIT_API_KEY;
}
