import { MatchNotFound } from 'csdm/node/database/matches/errors/match-not-found';
import { fetchMatchesByChecksums } from 'csdm/node/database/matches/fetch-matches-by-checksums';
import { handleError } from '../../handle-error';

export async function fetchMatchByChecksumHandler(checksum: string) {
  try {
    const matches = await fetchMatchesByChecksums([checksum]);
    if (matches.length === 0) {
      throw new MatchNotFound();
    }

    return matches[0];
  } catch (error) {
    handleError(error, `Error while fetching match with id ${checksum}`);
  }
}
