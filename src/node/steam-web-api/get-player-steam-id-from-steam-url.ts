import { getUsersSummary } from './get-users-summary';
import { getSteamApiKey } from './get-steam-api-key';
import { SteamApiForbiddenError } from './steam-api-forbidden-error';
import { SteamApiError } from './steamapi-error';
import { InvalidSteamCommunityUrl } from 'csdm/node/database/steam-accounts/errors/invalid-steam-community-url';
import { SteamTooMayRequests } from './steam-too-many-requests';
import { SteamAccountNotFound } from '../database/steam-accounts/errors/steam-account-not-found';

type SteamPlayerVanityResponse = {
  response: {
    steamid: string | undefined;
  };
};

async function getPlayerSteamIdFromPlayerId(playerProfile: string) {
  const steamApiKey = await getSteamApiKey();
  const response = await fetch(
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamApiKey}&vanityurl=${playerProfile}`,
  );
  if (response.status === 403) {
    throw new SteamApiForbiddenError();
  }
  if (response.status === 429) {
    throw new SteamTooMayRequests();
  }
  if (response.status !== 200) {
    throw new SteamApiError();
  }

  const { response: data }: SteamPlayerVanityResponse = await response.json();
  if (data.steamid === undefined) {
    throw new SteamAccountNotFound();
  }

  return data.steamid;
}

/**
 * Return the SteamID from a Steam community profile / id URL.
 * Example:
 * http://steamcommunity.com/profiles/76561198000697560/
 * http://steamcommunity.com/id/AkiVer/
 *
 */
export async function getPlayerSteamIdFromSteamUrl(url: string) {
  const profileUrlRegex = /(?:https?:\/\/)?steamcommunity\.com\/profiles\/(\d+)/;
  const profileMatch = profileUrlRegex.exec(url);
  if (profileMatch !== null && profileMatch.length > 0) {
    const steamId = profileMatch[1];
    // Fetch the player's info from Steam to make sure this SteamID exists.
    const [player] = await getUsersSummary([steamId]);
    if (player === undefined) {
      throw new SteamAccountNotFound();
    }
    return steamId;
  }

  const idUrlRegex = /(?:https?:\/\/)?steamcommunity\.com\/id\/([\dA-Za-z]+)/;
  const playerIdMatch = idUrlRegex.exec(url);
  if (playerIdMatch !== null && playerIdMatch.length > 0) {
    const playerId = playerIdMatch[1];
    const steamId = await getPlayerSteamIdFromPlayerId(playerId);
    return steamId;
  }

  throw new InvalidSteamCommunityUrl();
}
