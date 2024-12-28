import { getSettings } from 'csdm/node/settings/get-settings';
import { FiveEPlayResourceNotFound } from './errors/5eplay-resource-not-found';
import { fetch5EPlayMatch } from './fetch-5eplay-match';
import { Game } from 'csdm/common/types/counter-strike';
import type { FiveEPlayMatch } from 'csdm/common/types/5eplay-match';

type ListMatchResponsePayload =
  | {
      code: 0;
      data: {
        match_id: string;
      }[];
    }
  // Player not found payload
  | {
      code: 500;
      data: null;
    };

async function fetchLastMatchIdsForGame(accountId: string, game: Game, limit: number) {
  const type = game === Game.CSGO ? 1 : 0;
  const response = await fetch(
    `https://gate.5eplay.com/crane/http/api/data/match/list?uuid=${accountId}&limit=${limit}&cs_type=${type}`,
  );
  const matches: ListMatchResponsePayload = await response.json();

  if (matches.data === null) {
    throw new FiveEPlayResourceNotFound();
  }

  return matches.data.map((matchDTO) => matchDTO.match_id);
}

export async function fetchLast5EPlayMatches(accountId: string) {
  const matches: FiveEPlayMatch[] = [];
  const maxMatchCount = 8;
  const matchIds = await fetchLastMatchIdsForGame(accountId, Game.CS2, maxMatchCount);

  // We didn't find enough CS2 matches, find CS:GO matches
  if (matchIds.length < maxMatchCount) {
    const limit = maxMatchCount - matchIds.length;
    const csgoMatchIds = await fetchLastMatchIdsForGame(accountId, Game.CSGO, limit);
    if (csgoMatchIds.length > 0) {
      matchIds.push(...csgoMatchIds);
    }
  }

  if (matchIds.length === 0) {
    return matches;
  }

  const settings = await getSettings();
  const downloadFolderPath = settings.download.folderPath;

  for (const matchId of matchIds) {
    try {
      const match = await fetch5EPlayMatch(matchId, downloadFolderPath);
      matches.push(match);
    } catch (error) {
      if (!(error instanceof FiveEPlayResourceNotFound)) {
        throw error;
      }
    }
  }

  return matches;
}
