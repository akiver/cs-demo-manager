import { FaceitApiError } from './errors/faceit-api-error';
import { FaceitForbiddenError } from './errors/faceit-forbidden-error';
import { FaceitUnauthorized } from './errors/faceit-unauthorized';
import { FaceitResourceNotFound } from './errors/faceit-resource-not-found';
import type { FaceitResultDTO } from './faceit-result';
import { FaceitInvalidRequest } from './errors/faceit-invalid-request';
import type { FaceitGameId } from './faceit-game-id';

type FaceitPlayerDTO = {
  avatar: string;
  faceit_url: string;
  game_player_id: string;
  game_player_name: string;
  nickname: string;
  player_id: string;
  skill_level: number;
};

type FaceitTeamDTO = {
  avatar: string;
  nickname: string;
  players: FaceitPlayerDTO[];
  team_id: string;
  type: string;
};

type FaceitMatchHistoryDTO = {
  competition_id: string;
  competition_name: string;
  competition_type: string;
  faceit_url: string;
  finished_at: number;
  game_id: FaceitGameId;
  game_mode: string;
  match_id: string;
  match_type: string;
  max_players: number;
  organizer_id: string;
  playing_players: string[];
  region: string;
  results: FaceitResultDTO;
  started_at: number;
  status: string;
  teams: FaceitTeamDTO[];
  teams_size: number;
};

type FaceitHistoryDTO = {
  items: FaceitMatchHistoryDTO[];
};

async function fetchPlayerLastMatchesForGame(playerId: string, apiKey: string, game: FaceitGameId, limit: number) {
  const response = await fetch(
    `https://open.faceit.com/data/v4/players/${playerId}/history?limit=${limit}&game=${game}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    },
  );
  const { items: matches }: FaceitHistoryDTO = await response.json();

  if (response.status === 401) {
    throw new FaceitUnauthorized();
  }

  if (response.status === 404) {
    throw new FaceitResourceNotFound();
  }

  if (response.status === 403) {
    throw new FaceitForbiddenError();
  }

  if (response.status === 400) {
    throw new FaceitInvalidRequest();
  }

  if (response.status !== 200) {
    throw new FaceitApiError(response.status);
  }

  return matches;
}

export async function fetchPlayerLastMatches(playerId: string, apiKey: string) {
  const maxMatchCount = 8;
  const matches: FaceitMatchHistoryDTO[] = [];
  const cs2Matches = await fetchPlayerLastMatchesForGame(playerId, apiKey, 'cs2', maxMatchCount);
  if (cs2Matches.length > 0) {
    matches.push(...cs2Matches);
  }

  // We didn't find enough CS2 matches, find CS:GO matches
  if (matches.length < maxMatchCount) {
    const limit = maxMatchCount - matches.length;
    const csgoMatches = await fetchPlayerLastMatchesForGame(playerId, apiKey, 'csgo', limit);
    if (csgoMatches.length > 0) {
      matches.push(...csgoMatches);
    }
  }

  return matches;
}
