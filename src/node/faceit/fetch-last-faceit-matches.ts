import { getSettings } from 'csdm/node/settings/get-settings';
import { fetchPlayerLastMatches } from 'csdm/node/faceit-web-api/fetch-player-last-matches';
import { getFaceitApiKey } from 'csdm/node/faceit-web-api/get-faceit-api-key';
import { fetchFaceitMatches } from 'csdm/node/database/faceit-matches/fetch-faceit-matches';
import { insertFaceitMatch } from 'csdm/node/database/faceit-matches/insert-faceit-match';
import { fetchFaceitMatch } from './fetch-faceit-match';
import { FaceitResourceNotFound } from 'csdm/node/faceit-web-api/errors/faceit-resource-not-found';

export async function fetchLastFaceitMatches(accountId: string) {
  const apiKey = await getFaceitApiKey();
  const lastMatchesDTO = await fetchPlayerLastMatches(accountId, apiKey);
  const matchIds = lastMatchesDTO.map((matchDTO) => matchDTO.match_id);
  const matches = await fetchFaceitMatches(matchIds);
  const matchesNotInDatabaseDTO = lastMatchesDTO.filter((matchDTO) => {
    return !matches.some((match) => match.id === matchDTO.match_id);
  });
  const settings = await getSettings();
  const downloadFolderPath = settings.download.folderPath;

  for (const matchNotInDatabaseDTO of matchesNotInDatabaseDTO) {
    const matchId = matchNotInDatabaseDTO.match_id;
    try {
      const match = await fetchFaceitMatch(matchId, apiKey, downloadFolderPath);
      await insertFaceitMatch(match);
      matches.push(match);
    } catch (error) {
      if (error instanceof FaceitResourceNotFound) {
        logger.error(`FACEIT match ${matchId} not found`);
        logger.error(error);
      } else {
        throw error;
      }
    }
  }

  return matches;
}
